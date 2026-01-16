"""Authentication test endpoints."""
from fastapi import APIRouter, Depends
from backend.app.dependencies import get_current_user

router = APIRouter()


@router.get("/me")
async def get_current_user_info(
    user: dict = Depends(get_current_user)
):
    """
    Get current authenticated user information.

    This endpoint requires a valid JWT token in the Authorization header.
    Used to test authentication integration.

    Example request:
    ```
    GET /api/auth/me
    Authorization: Bearer <jwt_token>
    ```
    """
    return {
        "user_id": user["id"],
        "email": user["email"],
        "email_verified": user.get("email_verified", False),
        "authenticated": True,
    }
