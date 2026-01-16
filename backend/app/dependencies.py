"""FastAPI dependencies for Supabase integration."""
import logging
from typing import Optional
from supabase import create_client, Client
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from backend.app.config import settings

logger = logging.getLogger(__name__)

# Initialize Supabase client singleton
# Use service role key for backend operations
supabase: Client = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_KEY
)

# HTTP Bearer token security scheme
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """
    Verify JWT token and return authenticated user.

    This dependency extracts the JWT token from the Authorization header,
    verifies it with Supabase, and returns the user information.

    Args:
        credentials: HTTP Bearer token from Authorization header

    Returns:
        dict: User information including id, email, etc.

    Raises:
        HTTPException: 401 if token is invalid, expired, or missing
    """
    token = credentials.credentials

    try:
        # Verify JWT and extract claims
        # get_claims() verifies the token locally using JWKS (faster than get_user)
        claims = supabase.auth.get_claims(jwt=token)

        if not claims:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Extract user information from claims
        user_id = claims.get("sub")
        email = claims.get("email")

        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token missing user identifier",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Return user information
        return {
            "id": user_id,
            "email": email,
            "email_verified": claims.get("email_verified", False),
            "aud": claims.get("aud", "authenticated"),
            "role": claims.get("role", "authenticated"),
        }

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.warning(f"Authentication failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


# Optional: Dependency for endpoints that work with or without auth
async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(
        HTTPBearer(auto_error=False)
    )
) -> Optional[dict]:
    """
    Optional authentication dependency.

    Returns user if authenticated, None otherwise.
    Useful for endpoints that have different behavior for authenticated vs anonymous users.
    """
    if not credentials:
        return None

    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None
