import svgPaths from "./svg-ubq5ppsgji";
import clsx from "clsx";
import imgResultsPage from "figma:asset/28ae161ca94a38863b55fa191b862c3c542f78b7.png";
type ButtonBackgroundImageProps = {
  additionalClassNames?: string;
};

function ButtonBackgroundImage({ children, additionalClassNames = "" }: React.PropsWithChildren<ButtonBackgroundImageProps>) {
  return (
    <div style={{ backgroundImage: "linear-gradient(150.644deg, rgba(173, 70, 255, 0.1) 0%, rgba(0, 184, 219, 0.1) 100%)" }} className={clsx("absolute border border-[rgba(255,255,255,0.1)] border-solid h-[85.266px] overflow-clip rounded-[10px] top-0 w-[151.594px]", additionalClassNames)}>
      {children}
    </div>
  );
}
type ContainerBackgroundImage5Props = {
  additionalClassNames?: string;
};

function ContainerBackgroundImage5({ children, additionalClassNames = "" }: React.PropsWithChildren<ContainerBackgroundImage5Props>) {
  return (
    <div className={clsx("bg-[rgba(255,255,255,0.05)] h-[27.5px] relative rounded-[8px] shrink-0", additionalClassNames)}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[6px] items-center px-[8px] py-0 relative size-full">{children}</div>
    </div>
  );
}
type ContainerBackgroundImage4Props = {
  additionalClassNames?: string;
};

function ContainerBackgroundImage4({ children, additionalClassNames = "" }: React.PropsWithChildren<ContainerBackgroundImage4Props>) {
  return (
    <div className={clsx("bg-[rgba(0,201,80,0.1)] h-[26px] relative rounded-[8px] shrink-0", additionalClassNames)}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-center px-[8px] py-0 relative size-full">{children}</div>
    </div>
  );
}

function ContainerBackgroundImage3({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="bg-[rgba(173,70,255,0.1)] relative rounded-[10px] shrink-0 size-[50px]">
      <div aria-hidden="true" className="absolute border border-[rgba(173,70,255,0.2)] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-px pt-[9px] px-[9px] relative size-full">{children}</div>
    </div>
  );
}
type ContainerBackgroundImage2Props = {
  additionalClassNames?: string;
};

function ContainerBackgroundImage2({ children, additionalClassNames = "" }: React.PropsWithChildren<ContainerBackgroundImage2Props>) {
  return (
    <div className={clsx("relative shrink-0", additionalClassNames)}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center relative size-full">{children}</div>
    </div>
  );
}
type BackgroundImage7Props = {
  additionalClassNames?: string;
};

function BackgroundImage7({ children, additionalClassNames = "" }: React.PropsWithChildren<BackgroundImage7Props>) {
  return (
    <div className={clsx("size-[14px]", additionalClassNames)}>
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        {children}
      </svg>
    </div>
  );
}

function BackgroundImage6({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="content-stretch flex h-[16.5px] items-start relative shrink-0 w-full">
      <p className="basis-0 font-['Arial:Regular',sans-serif] grow leading-[16.5px] min-h-px min-w-px not-italic relative shrink-0 text-[#6a7282] text-[11px]">{children}</p>
    </div>
  );
}

function BackgroundImage5({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="absolute h-[22.391px] left-[26px] top-[102px] w-[719.188px]">
      <p className="absolute font-['Arial:Regular',sans-serif] leading-[22.4px] left-0 not-italic text-[#d1d5dc] text-[14px] text-nowrap top-[-2px]">{children}</p>
    </div>
  );
}
type BackgroundImage4Props = {
  additionalClassNames?: string;
};

function BackgroundImage4({ children, additionalClassNames = "" }: React.PropsWithChildren<BackgroundImage4Props>) {
  return (
    <div className={additionalClassNames}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">{children}</div>
    </div>
  );
}
type BackgroundImage3Props = {
  additionalClassNames?: string;
};

function BackgroundImage3({ children, additionalClassNames = "" }: React.PropsWithChildren<BackgroundImage3Props>) {
  return <BackgroundImage4 additionalClassNames={clsx("relative shrink-0", additionalClassNames)}>{children}</BackgroundImage4>;
}
type BackgroundImage2Props = {
  additionalClassNames?: string;
};

function BackgroundImage2({ children, additionalClassNames = "" }: React.PropsWithChildren<BackgroundImage2Props>) {
  return <BackgroundImage4 additionalClassNames={clsx("basis-0 grow min-h-px min-w-px relative shrink-0", additionalClassNames)}>{children}</BackgroundImage4>;
}

function IconBackgroundImage5({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="absolute left-[697.19px] size-[48px] top-[26px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
        <g id="Icon" opacity="0.05">
          {children}
        </g>
      </svg>
    </div>
  );
}

function IconBackgroundImage4({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="relative shrink-0 size-[20px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">{children}</g>
      </svg>
    </div>
  );
}

function BackgroundImage1({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="relative shrink-0 size-[24px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icon">{children}</g>
      </svg>
    </div>
  );
}
type BackgroundImageProps = {
  additionalClassNames?: string;
};

function BackgroundImage({ children, additionalClassNames = "" }: React.PropsWithChildren<BackgroundImageProps>) {
  return (
    <div className={clsx("size-[16px]", additionalClassNames)}>
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">{children}</g>
      </svg>
    </div>
  );
}
type ContainerBackgroundImageAndText5Props = {
  text: string;
  additionalClassNames?: string;
};

function ContainerBackgroundImageAndText5({ text, additionalClassNames = "" }: ContainerBackgroundImageAndText5Props) {
  return (
    <div className={clsx("h-[28px] relative rounded-[3.35544e+07px] shrink-0", additionalClassNames)}>
      <div aria-hidden="true" className="absolute border border-[rgba(0,201,80,0.5)] border-solid inset-0 pointer-events-none rounded-[3.35544e+07px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Arial:Bold','Noto_Sans_Symbols2:Regular',sans-serif] leading-[18px] left-[13px] not-italic text-[#05df72] text-[12px] text-nowrap top-[4px]">{text}</p>
      </div>
    </div>
  );
}
type ContainerBackgroundImageAndText4Props = {
  text: string;
  additionalClassNames?: string;
};

function ContainerBackgroundImageAndText4({ text, additionalClassNames = "" }: ContainerBackgroundImageAndText4Props) {
  return (
    <div className={clsx("absolute h-[15px] left-[687.16px] w-[70.031px]", additionalClassNames)}>
      <p className="absolute font-['Arial:Regular',sans-serif] leading-[15px] left-0 not-italic text-[#6a7282] text-[10px] top-[-2px] w-[71px]">{text}</p>
    </div>
  );
}
type ContainerBackgroundImage1Props = {
  additionalClassNames?: string;
};

function ContainerBackgroundImage1({ additionalClassNames = "" }: ContainerBackgroundImage1Props) {
  return (
    <div className={clsx("absolute content-stretch flex gap-[12px] h-[39px] items-center left-[26px] w-[719.188px]", additionalClassNames)}>
      <div className="basis-0 bg-[rgba(173,70,255,0.2)] grow h-[39px] min-h-px min-w-px relative rounded-[10px] shrink-0">
        <div aria-hidden="true" className="absolute border border-[#ad46ff] border-solid inset-0 pointer-events-none rounded-[10px]" />
        <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
          <p className="absolute font-['Arial:Regular',sans-serif] leading-[21px] left-[280.05px] not-italic text-[#dab2ff] text-[14px] text-center text-nowrap top-[8px] translate-x-[-50%]">{"Jump to Moment →"}</p>
        </div>
      </div>
      <div className="h-[39px] relative rounded-[10px] shrink-0 w-[148.203px]">
        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.2)] border-solid inset-0 pointer-events-none rounded-[10px]" />
        <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
          <p className="absolute font-['Arial:Regular',sans-serif] leading-[21px] left-[74px] not-italic text-[#99a1af] text-[14px] text-center text-nowrap top-[8px] translate-x-[-50%]">{"Mark as Reviewed"}</p>
        </div>
      </div>
    </div>
  );
}
type ParagraphBackgroundImageAndText4Props = {
  text: string;
};

function ParagraphBackgroundImageAndText4({ text }: ParagraphBackgroundImageAndText4Props) {
  return (
    <div className="h-[22.391px] relative shrink-0 w-full">
      <p className="absolute font-['Arial:Regular',sans-serif] leading-[22.4px] left-0 not-italic text-[#cefafe] text-[14px] text-nowrap top-[-2px]">{text}</p>
    </div>
  );
}
type ContainerBackgroundImageProps = {
  additionalClassNames?: string;
};

function ContainerBackgroundImage({ additionalClassNames = "" }: ContainerBackgroundImageProps) {
  return (
    <div className="content-stretch flex gap-[8px] h-[19.5px] items-center relative shrink-0 w-full">
      <IconBackgroundImage3 />
      <TextBackgroundImageAndText5 text="How to fix:" additionalClassNames="w-[64.219px]" />
    </div>
  );
}
type TextBackgroundImageAndText5Props = {
  text: string;
  additionalClassNames?: string;
};

function TextBackgroundImageAndText5({ text, additionalClassNames = "" }: TextBackgroundImageAndText5Props) {
  return (
    <BackgroundImage4 additionalClassNames={clsx("h-[19.5px] relative shrink-0", additionalClassNames)}>
      <p className="absolute font-['Arial:Bold',sans-serif] leading-[19.5px] left-0 not-italic text-[#53eafd] text-[13px] text-nowrap top-[-1px]">{text}</p>
    </BackgroundImage4>
  );
}
type BackgroundImageAndTextProps = {
  text: string;
};

function BackgroundImageAndText({ text }: BackgroundImageAndTextProps) {
  return <BackgroundImage5>{text}</BackgroundImage5>;
}
type ParagraphBackgroundImageAndText3Props = {
  text: string;
};

function ParagraphBackgroundImageAndText3({ text }: ParagraphBackgroundImageAndText3Props) {
  return (
    <div className="h-[22.391px] relative shrink-0 w-full">
      <p className="absolute font-['Arial:Regular',sans-serif] leading-[22.4px] left-0 not-italic text-[#d1d5dc] text-[14px] text-nowrap top-[-2px]">{text}</p>
    </div>
  );
}
type TextBackgroundImageAndText4Props = {
  text: string;
  additionalClassNames?: string;
};

function TextBackgroundImageAndText4({ text, additionalClassNames = "" }: TextBackgroundImageAndText4Props) {
  return (
    <div className={clsx("absolute content-stretch flex h-[15px] items-start left-[26px] top-[72px]", additionalClassNames)}>
      <p className="font-['Arial:Bold',sans-serif] leading-[16.5px] not-italic relative shrink-0 text-[#c27aff] text-[11px] text-nowrap tracking-[0.55px] uppercase">{text}</p>
    </div>
  );
}
type TextBackgroundImageAndText3Props = {
  text: string;
};

function TextBackgroundImageAndText3({ text }: TextBackgroundImageAndText3Props) {
  return (
    <BackgroundImage2 additionalClassNames="h-[19.5px]">
      <p className="absolute font-['Arial:Regular',sans-serif] leading-[19.5px] left-0 not-italic text-[#99a1af] text-[13px] top-[-1px] w-[47px]">{text}</p>
    </BackgroundImage2>
  );
}
type ContainerBackgroundImageAndText3Props = {
  text: string;
};

function ContainerBackgroundImageAndText3({ text }: ContainerBackgroundImageAndText3Props) {
  return (
    <div className="bg-[rgba(254,154,0,0.2)] h-[28px] relative rounded-[3.35544e+07px] shrink-0 w-[102.75px]">
      <div aria-hidden="true" className="absolute border border-[#fe9a00] border-solid inset-0 pointer-events-none rounded-[3.35544e+07px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Arial:Bold',sans-serif] leading-[18px] left-[13px] not-italic text-[#ffb900] text-[12px] text-nowrap top-[4px]">{text}</p>
      </div>
    </div>
  );
}

function IconBackgroundImage3() {
  return (
    <BackgroundImage additionalClassNames="relative shrink-0">
      <path d={svgPaths.p18577c80} id="Vector" stroke="var(--stroke-0, #00D3F2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
      <path d="M6 12H10" id="Vector_2" stroke="var(--stroke-0, #00D3F2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
      <path d="M6.66667 14.6667H9.33333" id="Vector_3" stroke="var(--stroke-0, #00D3F2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
    </BackgroundImage>
  );
}
type ParagraphBackgroundImageAndText2Props = {
  text: string;
};

function ParagraphBackgroundImageAndText2({ text }: ParagraphBackgroundImageAndText2Props) {
  return (
    <div className="h-[18px] relative shrink-0 w-full">
      <p className="absolute font-['Arial:Regular',sans-serif] leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] text-nowrap top-[-1px]">{text}</p>
    </div>
  );
}
type TextBackgroundImageAndText2Props = {
  text: string;
};

function TextBackgroundImageAndText2({ text }: TextBackgroundImageAndText2Props) {
  return (
    <BackgroundImage2 additionalClassNames="h-[19.5px]">
      <p className="absolute font-['Arial:Regular',sans-serif] leading-[19.5px] left-0 not-italic text-[#99a1af] text-[13px] top-[-1px] w-[45px]">{text}</p>
    </BackgroundImage2>
  );
}

function IconBackgroundImage2() {
  return (
    <div className="relative shrink-0 size-[12px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g clipPath="url(#clip0_22_2404)" id="Icon">
          <path d="M6 3V6L8 7" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" />
          <path d={svgPaths.p3e7757b0} id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <defs>
          <clipPath id="clip0_22_2404">
            <rect fill="white" height="12" width="12" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}
type ContainerBackgroundImageAndText2Props = {
  text: string;
};

function ContainerBackgroundImageAndText2({ text }: ContainerBackgroundImageAndText2Props) {
  return (
    <div className="absolute h-[48px] left-[25px] top-[116px] w-[262.5px]">
      <p className="absolute font-['Arial:Black',sans-serif] leading-[48px] left-0 not-italic text-[#ff6467] text-[48px] text-nowrap top-[2px]">{text}</p>
    </div>
  );
}
type TextBackgroundImageAndText1Props = {
  text: string;
};

function TextBackgroundImageAndText1({ text }: TextBackgroundImageAndText1Props) {
  return (
    <BackgroundImage2 additionalClassNames="h-[18px]">
      <p className="absolute font-['Arial:Bold',sans-serif] leading-[18px] left-0 not-italic text-[#05df72] text-[12px] top-[-1px] w-[16px]">{text}</p>
    </BackgroundImage2>
  );
}
type ParagraphBackgroundImageAndText1Props = {
  text: string;
  additionalClassNames?: string;
};

function ParagraphBackgroundImageAndText1({ text, additionalClassNames = "" }: ParagraphBackgroundImageAndText1Props) {
  return (
    <div className={clsx("absolute content-stretch flex h-[16.797px] items-start left-[22px] top-[12px]", additionalClassNames)}>
      <p className="font-['Arial:Regular',sans-serif] leading-[16.8px] not-italic relative shrink-0 text-[#d1d5dc] text-[12px] text-nowrap">{text}</p>
    </div>
  );
}
type ParagraphBackgroundImageAndTextProps = {
  text: string;
};

function ParagraphBackgroundImageAndText({ text }: ParagraphBackgroundImageAndTextProps) {
  return <BackgroundImage6>{text}</BackgroundImage6>;
}
type ContainerBackgroundImageAndText1Props = {
  text: string;
};

function ContainerBackgroundImageAndText1({ text }: ContainerBackgroundImageAndText1Props) {
  return (
    <div className="absolute h-[48px] left-[25px] top-[116px] w-[262.5px]">
      <p className="absolute font-['Arial:Black',sans-serif] leading-[48px] left-0 not-italic text-[#05df72] text-[48px] text-nowrap top-[2px]">{text}</p>
    </div>
  );
}
type HeadingBackgroundImageAndTextProps = {
  text: string;
};

function HeadingBackgroundImageAndText({ text }: HeadingBackgroundImageAndTextProps) {
  return (
    <div className="absolute h-[21px] left-[25px] top-[87px] w-[262.5px]">
      <p className="absolute font-['Arial:Regular',sans-serif] leading-[21px] left-0 not-italic text-[#99a1af] text-[14px] text-nowrap top-[-1px]">{text}</p>
    </div>
  );
}

function IconBackgroundImage1() {
  return (
    <BackgroundImage7 additionalClassNames="relative shrink-0">
      <g id="Icon">
        <path d={svgPaths.p3471a100} id="Vector" stroke="var(--stroke-0, #05DF72)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.45833" />
        <path d={svgPaths.p1977ee80} id="Vector_2" stroke="var(--stroke-0, #05DF72)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.45833" />
      </g>
    </BackgroundImage7>
  );
}

function IconBackgroundImage() {
  return (
    <BackgroundImage1>
      <path d={svgPaths.p98c0680} fill="var(--fill-0, white)" id="Vector" />
    </BackgroundImage1>
  );
}
type ContainerBackgroundImageAndTextProps = {
  text: string;
  additionalClassNames?: string;
};

function ContainerBackgroundImageAndText({ text, additionalClassNames = "" }: ContainerBackgroundImageAndTextProps) {
  return (
    <div className={clsx("absolute bg-[rgba(0,0,0,0.7)] content-stretch flex h-[20.5px] items-start left-[8px] px-[8px] py-[2px] rounded-[4px] top-[54.77px]", additionalClassNames)}>
      <p className="font-['Arial:Regular',sans-serif] leading-[16.5px] not-italic relative shrink-0 text-[11px] text-center text-nowrap text-white">{text}</p>
    </div>
  );
}
type TextBackgroundImageAndTextProps = {
  text: string;
};

function TextBackgroundImageAndText({ text }: TextBackgroundImageAndTextProps) {
  return (
    <div className="h-[15px] relative shrink-0 w-[3.281px]">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Arial:Bold',sans-serif] leading-[15px] not-italic relative shrink-0 text-[10px] text-center text-nowrap text-white">{text}</p>
      </div>
    </div>
  );
}

export default function UploadPageForCoherence() {
  return (
    <div className="bg-white relative size-full" data-name="Upload Page for Coherence">
      <div className="absolute bg-[#0f172a] h-[1928.797px] left-0 overflow-clip top-0 w-[1402px]" data-name="ResultsPage">
        <div className="absolute content-stretch flex gap-[8px] h-[21px] items-center left-[40px] top-[40px] w-[120.609px]" data-name="Button">
          <BackgroundImage additionalClassNames="relative shrink-0">
            <path d={svgPaths.p203476e0} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
            <path d="M12.6667 8H3.33333" id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </BackgroundImage>
          <BackgroundImage2 additionalClassNames="h-[21px]">
            <p className="absolute font-['Arial:Regular',sans-serif] leading-[21px] left-[48px] not-italic text-[#99a1af] text-[14px] text-center text-nowrap top-[-1px] translate-x-[-50%]">Back to Upload</p>
          </BackgroundImage2>
        </div>
        <div className="absolute bg-[rgba(255,255,255,0.03)] content-stretch flex flex-col h-[250px] items-start left-[376px] pb-px pt-[33px] px-[33px] rounded-[16px] top-[85px] w-[650px]" data-name="Header">
          <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.08)] border-solid inset-0 pointer-events-none rounded-[16px]" />
          <div className="content-stretch flex h-[184px] items-center justify-between relative shrink-0 w-full" data-name="Container">
            <BackgroundImage3 additionalClassNames="h-[175.5px] w-[140px]">
              <div className="absolute bg-[rgba(254,154,0,0.2)] h-[27.5px] left-[21.95px] rounded-[3.35544e+07px] top-[148px] w-[96.078px]" data-name="Container">
                <p className="absolute font-['Arial:Bold',sans-serif] leading-[19.5px] left-[16px] not-italic text-[#ffb900] text-[13px] text-nowrap top-[3px]">Good Start</p>
              </div>
              <div className="absolute left-0 size-[140px] top-0" data-name="Container">
                <div className="absolute flex items-center justify-center left-0 size-[140px] top-[-0.25px]" style={{ "--transform-inner-width": "300", "--transform-inner-height": "150" } as React.CSSProperties}>
                  <div className="flex-none rotate-[270deg]">
                    <div className="relative size-[140px]" data-name="Icon">
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 140 140">
                        <g clipPath="url(#clip0_22_2369)" id="Icon">
                          <path d={svgPaths.p9e69970} id="Vector" stroke="var(--stroke-0, white)" strokeOpacity="0.1" strokeWidth="12" />
                          <path d={svgPaths.p9e69970} id="Vector_2" stroke="url(#paint0_linear_22_2369)" strokeDasharray="402.12 402.12" strokeLinecap="round" strokeWidth="12" />
                          <path d={svgPaths.p9e69970} id="Vector_3" opacity="0.5" stroke="url(#paint1_linear_22_2369)" strokeDasharray="402.12 402.12" strokeLinecap="round" strokeWidth="12" />
                        </g>
                        <defs>
                          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_22_2369" x1="6" x2="12806" y1="6" y2="12806">
                            <stop stopColor="#F59E0B" />
                            <stop offset="1" stopColor="#FCD34D" />
                          </linearGradient>
                          <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_22_2369" x1="6" x2="12806" y1="6" y2="6">
                            <stop stopColor="white" stopOpacity="0" />
                            <stop offset="0.5" stopColor="white" stopOpacity="0.3" />
                            <stop offset="1" stopColor="white" stopOpacity="0" />
                          </linearGradient>
                          <clipPath id="clip0_22_2369">
                            <rect fill="white" height="140" width="140" />
                          </clipPath>
                        </defs>
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="absolute content-stretch flex flex-col gap-[8px] items-center justify-center left-0 size-[140px] top-0" data-name="Container">
                  <BackgroundImage3 additionalClassNames="h-[56px] w-[67.109px]">
                    <p className="absolute font-['Arial:Black',sans-serif] leading-[56px] left-[-8.45px] not-italic text-[52px] text-nowrap text-white top-[9.5px]">67</p>
                  </BackgroundImage3>
                  <div className="h-[19.5px] relative shrink-0 w-[148.313px]" data-name="Container">
                    <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
                      <BackgroundImage2 additionalClassNames="h-[19.5px]">
                        <p className="absolute font-['Arial:Regular',sans-serif] leading-[19.5px] left-[90.16px] not-italic text-[#99a1af] text-[13px] text-nowrap top-[-19.5px]">/100</p>
                      </BackgroundImage2>
                    </div>
                  </div>
                </div>
              </div>
            </BackgroundImage3>
            <div className="basis-0 grow h-[61.5px] min-h-px min-w-px relative shrink-0" data-name="Container">
              <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[12px] items-start px-[24px] py-0 relative size-full">
                <div className="h-[30px] overflow-clip relative shrink-0 w-full" data-name="Heading 1">
                  <p className="absolute font-['Arial:Bold',sans-serif] leading-[30px] left-0 not-italic text-[20px] text-nowrap text-white top-[-3px]">MBA Product Pitch - Final Presentation</p>
                </div>
                <div className="content-stretch flex h-[19.5px] items-center relative shrink-0 w-full" data-name="Container">
                  <div className="h-[19.5px] relative shrink-0 w-[148.313px]" data-name="Container">
                    <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[6px] items-center relative size-full">
                      <BackgroundImage additionalClassNames="relative shrink-0">
                        <path d="M5.33333 1.33333V4" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                        <path d="M10.6667 1.33333V4" id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                        <path d={svgPaths.p3ee34580} id="Vector_3" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                        <path d="M2 6.66667H14" id="Vector_4" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                      </BackgroundImage>
                      <BackgroundImage2 additionalClassNames="h-[19.5px]">
                        <p className="absolute font-['Arial:Regular',sans-serif] leading-[19.5px] left-0 not-italic text-[#99a1af] text-[13px] top-[-1px] w-[127px]">Analyzed Jan 10, 2026</p>
                      </BackgroundImage2>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute h-[749.5px] left-[40px] top-[367px] w-[1322px]" data-name="Container">
          <div className="absolute bg-[rgba(255,255,255,0.03)] content-stretch flex flex-col gap-[16px] h-[557.453px] items-start left-0 pb-px pt-[25px] px-[25px] rounded-[16px] top-0 w-[528.797px]" data-name="VideoPlayer">
            <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.08)] border-solid inset-0 pointer-events-none rounded-[16px]" />
            <div className="bg-[rgba(255,255,255,0)] h-[270.188px] relative rounded-[14px] shrink-0 w-full" data-name="Container">
              <div className="overflow-clip relative rounded-[inherit] size-full">
                <div className="absolute bg-black h-[268.188px] left-px top-px w-[476.797px]" data-name="Video" />
                <div className="absolute bg-[rgba(0,0,0,0.3)] content-stretch flex h-[268.188px] items-center justify-center left-px opacity-0 pl-0 pr-[0.016px] py-0 top-px w-[476.797px]" data-name="Button">
                  <div className="bg-[rgba(173,70,255,0.9)] relative rounded-[3.35544e+07px] shrink-0 size-[80px]" data-name="Container">
                    <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[4px] pr-0 py-0 relative size-full">
                      <div className="relative shrink-0 size-[40px]" data-name="Icon">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 40 40">
                          <g id="Icon">
                            <path d={svgPaths.p1d4b1d80} fill="var(--fill-0, white)" id="Vector" />
                          </g>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none rounded-[14px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.5)]" />
            </div>
            <div className="content-stretch flex flex-col gap-[16px] h-[62px] items-start relative shrink-0 w-full" data-name="Container">
              <div className="bg-[rgba(255,255,255,0.2)] h-[6px] relative rounded-[3.35544e+07px] shrink-0 w-full" data-name="Container">
                <div className="absolute bg-gradient-to-r from-[#ad46ff] h-[6px] left-0 rounded-[3.35544e+07px] to-[#00b8db] top-0 w-0" data-name="Container" />
                <div className="absolute bg-white left-[-8px] opacity-0 rounded-[3.35544e+07px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] size-[16px] top-[-13px]" data-name="Container" />
              </div>
              <div className="content-stretch flex h-[40px] items-center justify-between relative shrink-0 w-full" data-name="Container">
                <div className="h-[40px] relative shrink-0 w-[247.203px]" data-name="Container">
                  <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] items-center relative size-full">
                    <div className="bg-[#ad46ff] relative rounded-[3.35544e+07px] shrink-0 size-[40px]" data-name="Button">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[2px] pr-0 py-0 relative size-full">
                        <IconBackgroundImage4>
                          <path d={svgPaths.p2af6372} fill="var(--fill-0, white)" id="Vector" />
                        </IconBackgroundImage4>
                      </div>
                    </div>
                    <div className="basis-0 grow h-[20px] min-h-px min-w-px relative shrink-0" data-name="Container">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
                        <div className="relative shrink-0 size-[20px]" data-name="Button">
                          <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
                            <div className="h-[20px] overflow-clip relative shrink-0 w-full" data-name="Icon">
                              <div className="absolute inset-[16.66%_54.17%_16.65%_8.33%]" data-name="Vector">
                                <div className="absolute inset-[-6.25%_-11.11%]">
                                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.16667 15.005">
                                    <path d={svgPaths.p3a1d24f0} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                                  </svg>
                                </div>
                              </div>
                              <div className="absolute inset-[37.5%_29.17%_37.5%_66.67%]" data-name="Vector">
                                <div className="absolute inset-[-16.67%_-100%_-16.67%_-100.01%]">
                                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2.50005 6.66676">
                                    <path d={svgPaths.p5c92300} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                                  </svg>
                                </div>
                              </div>
                              <div className="absolute inset-[23.48%_8.33%_23.48%_80.68%]" data-name="Vector">
                                <div className="absolute inset-[-7.86%_-37.94%]">
                                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 3.8634 12.2733">
                                    <path d={svgPaths.p250d8200} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="basis-0 bg-[rgba(255,255,255,0.2)] grow h-[4px] min-h-px min-w-px rounded-[3.35544e+07px] shrink-0" data-name="Range Slider" />
                      </div>
                    </div>
                    <BackgroundImage3 additionalClassNames="h-[21px] w-[67.203px]">
                      <p className="absolute font-['Arial:Regular',sans-serif] leading-[21px] left-0 not-italic text-[#d1d5dc] text-[14px] top-[-1px] w-[68px]">0:00 / 3:42</p>
                    </BackgroundImage3>
                  </div>
                </div>
                <ContainerBackgroundImage2 additionalClassNames="h-[33.5px] w-[84.266px]">
                  <div className="basis-0 bg-[rgba(255,255,255,0.05)] grow h-[33.5px] min-h-px min-w-px relative rounded-[10px] shrink-0" data-name="Button">
                    <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none rounded-[10px]" />
                    <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                      <p className="absolute font-['Arial:Regular',sans-serif] leading-[19.5px] left-[20.5px] not-italic text-[#d1d5dc] text-[13px] text-center top-[6px] translate-x-[-50%] w-[15px]">1×</p>
                    </div>
                  </div>
                  <div className="relative shrink-0 size-[32px]" data-name="Button">
                    <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
                      <IconBackgroundImage4>
                        <path d={svgPaths.p392de000} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                        <path d={svgPaths.p12d23980} id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                        <path d={svgPaths.p28a5b80} id="Vector_3" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                        <path d={svgPaths.p3aee1b80} id="Vector_4" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                      </IconBackgroundImage4>
                    </div>
                  </div>
                </ContainerBackgroundImage2>
              </div>
            </div>
            <div className="content-stretch flex flex-col gap-[12px] h-[139.266px] items-start pb-0 pt-[21px] px-0 relative shrink-0 w-full" data-name="Container">
              <div aria-hidden="true" className="absolute border-[1px_0px_0px] border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none" />
              <div className="h-[21px] relative shrink-0 w-full" data-name="Heading 3">
                <p className="absolute font-['Arial:Regular',sans-serif] leading-[21px] left-0 not-italic text-[14px] text-nowrap text-white top-[-1px]">Key Moments</p>
              </div>
              <div className="h-[85.266px] relative shrink-0 w-full" data-name="Container">
                <ButtonBackgroundImage additionalClassNames="left-0">
                  <div className="absolute bg-[#fb2c36] content-stretch flex items-center justify-center left-[117.59px] rounded-[3.35544e+07px] size-[24px] top-[8px]" data-name="Container">
                    <TextBackgroundImageAndText text="!" />
                  </div>
                  <ContainerBackgroundImageAndText text="0:15" additionalClassNames="w-[35.297px]" />
                  <div className="absolute bg-[rgba(173,70,255,0.2)] content-stretch flex h-[83.266px] items-center justify-center left-0 opacity-0 top-0 w-[149.594px]" data-name="Container">
                    <IconBackgroundImage />
                  </div>
                </ButtonBackgroundImage>
                <ButtonBackgroundImage additionalClassNames="left-[163.59px]">
                  <div className="absolute bg-[#fe9a00] content-stretch flex items-center justify-center left-[117.59px] rounded-[3.35544e+07px] size-[24px] top-[8px]" data-name="Container">
                    <TextBackgroundImageAndText text="!" />
                  </div>
                  <ContainerBackgroundImageAndText text="0:45" additionalClassNames="w-[37.219px]" />
                  <div className="absolute bg-[rgba(173,70,255,0.2)] content-stretch flex h-[83.266px] items-center justify-center left-0 opacity-0 top-0 w-[149.594px]" data-name="Container">
                    <IconBackgroundImage />
                  </div>
                </ButtonBackgroundImage>
                <ButtonBackgroundImage additionalClassNames="left-[327.19px]">
                  <div className="absolute bg-[#fb2c36] content-stretch flex items-center justify-center left-[117.59px] rounded-[3.35544e+07px] size-[24px] top-[8px]" data-name="Container">
                    <TextBackgroundImageAndText text="!" />
                  </div>
                  <ContainerBackgroundImageAndText text="1:45" additionalClassNames="w-[35.531px]" />
                  <div className="absolute bg-[rgba(173,70,255,0.2)] content-stretch flex h-[83.266px] items-center justify-center left-0 opacity-0 top-0 w-[149.594px]" data-name="Container">
                    <IconBackgroundImage />
                  </div>
                </ButtonBackgroundImage>
              </div>
            </div>
          </div>
          <div className="absolute gap-[24px] grid grid-cols-[repeat(4,_minmax(0px,_1fr))] grid-rows-[repeat(1,_minmax(0px,_1fr))] h-[273.297px] left-0 top-[628px] w-[1322px]" data-name="MetricsGrid">
            <div className="[grid-area:1_/_1] bg-[rgba(255,255,255,0.03)] h-[273.297px] justify-self-stretch relative rounded-[14px] shrink-0" data-name="MetricCard">
              <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.08)] border-solid inset-0 pointer-events-none rounded-[14px]" />
              <div className="absolute content-stretch flex h-[50px] items-center justify-between left-[25px] top-[25px] w-[262.5px]" data-name="Container">
                <ContainerBackgroundImage3>
                  <div className="h-[32px] overflow-clip relative shrink-0 w-full" data-name="Icon">
                    <div className="absolute inset-[20.84%_8.33%]" data-name="Vector">
                      <div className="absolute inset-[-7.14%_-5%]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 29.3347 21.3317">
                          <path d={svgPaths.p298faf00} id="Vector" stroke="var(--stroke-0, #C27AFF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                        </svg>
                      </div>
                    </div>
                    <div className="absolute inset-[37.5%]" data-name="Vector">
                      <div className="absolute inset-[-16.67%]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.6667 10.6667">
                          <path d={svgPaths.p3a6156f0} id="Vector" stroke="var(--stroke-0, #C27AFF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </ContainerBackgroundImage3>
                <ContainerBackgroundImage4 additionalClassNames="w-[53.844px]">
                  <IconBackgroundImage1 />
                  <BackgroundImage2 additionalClassNames="h-[18px]">
                    <p className="absolute font-['Arial:Bold',sans-serif] leading-[18px] left-0 not-italic text-[#05df72] text-[12px] top-[-1px] w-[20px]">+12</p>
                  </BackgroundImage2>
                </ContainerBackgroundImage4>
              </div>
              <HeadingBackgroundImageAndText text="Eye Contact" />
              <ContainerBackgroundImageAndText1 text="85%" />
              <div className="absolute content-stretch flex flex-col gap-[6px] h-[30.5px] items-start left-[25px] top-[176px] w-[262.5px]" data-name="Container">
                <div className="bg-[rgba(255,255,255,0.1)] h-[8px] relative rounded-[3.35544e+07px] shrink-0 w-full" data-name="Container">
                  <div className="overflow-clip rounded-[inherit] size-full">
                    <div className="content-stretch flex flex-col items-start pl-0 pr-[14.594px] py-0 relative size-full">
                      <div className="bg-gradient-to-r from-[#ad46ff] h-[8px] rounded-[3.35544e+07px] shrink-0 to-[#00b8db] w-full" data-name="Container" />
                    </div>
                  </div>
                </div>
                <ParagraphBackgroundImageAndText text="Target: 90%" />
              </div>
              <div className="absolute border-[1px_0px_0px] border-[rgba(255,255,255,0.05)] border-solid h-[29.797px] left-[25px] top-[218.5px] w-[262.5px]" data-name="Container">
                <BackgroundImage7 additionalClassNames="absolute left-0 top-[14px]">
                  <g clipPath="url(#clip0_22_2313)" id="Icon">
                    <path d={svgPaths.p27d0bb40} id="Vector" stroke="var(--stroke-0, #05DF72)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
                    <path d={svgPaths.pd7eb500} id="Vector_2" stroke="var(--stroke-0, #05DF72)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
                  </g>
                  <defs>
                    <clipPath id="clip0_22_2313">
                      <rect fill="white" height="14" width="14" />
                    </clipPath>
                  </defs>
                </BackgroundImage7>
                <ParagraphBackgroundImageAndText1 text="Great job! Above average" additionalClassNames="w-[134.719px]" />
              </div>
            </div>
            <div className="[grid-area:1_/_2] bg-[rgba(255,255,255,0.03)] h-[273.297px] justify-self-stretch relative rounded-[14px] shrink-0" data-name="MetricCard">
              <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.08)] border-solid inset-0 pointer-events-none rounded-[14px]" />
              <div className="absolute content-stretch flex h-[50px] items-center justify-between left-[25px] top-[25px] w-[262.5px]" data-name="Container">
                <ContainerBackgroundImage3>
                  <div className="h-[32px] overflow-clip relative shrink-0 w-full" data-name="Icon">
                    <div className="absolute inset-[12.5%_8.33%_8.35%_8.33%]" data-name="Vector">
                      <div className="absolute inset-[-5.26%_-5%]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 29.3333 27.9945">
                          <path d={svgPaths.p1a6cab00} id="Vector" stroke="var(--stroke-0, #C27AFF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </ContainerBackgroundImage3>
                <ContainerBackgroundImage4 additionalClassNames="w-[49.016px]">
                  <IconBackgroundImage1 />
                  <TextBackgroundImageAndText1 text="+5" />
                </ContainerBackgroundImage4>
              </div>
              <HeadingBackgroundImageAndText text="Filler Words" />
              <ContainerBackgroundImageAndText2 text="8" />
              <div className="absolute content-stretch flex flex-col gap-[6px] h-[30.5px] items-start left-[25px] top-[176px] w-[262.5px]" data-name="Container">
                <div className="bg-[rgba(255,255,255,0.1)] h-[8px] relative rounded-[3.35544e+07px] shrink-0 w-full" data-name="Container">
                  <div className="overflow-clip rounded-[inherit] size-full">
                    <div className="content-stretch flex flex-col items-start pl-0 pr-[210px] py-0 relative size-full">
                      <div className="bg-gradient-to-r from-[#ad46ff] h-[8px] rounded-[3.35544e+07px] shrink-0 to-[#00b8db] w-full" data-name="Container" />
                    </div>
                  </div>
                </div>
                <BackgroundImage6>{`Target: <10`}</BackgroundImage6>
              </div>
              <div className="absolute border-[1px_0px_0px] border-[rgba(255,255,255,0.05)] border-solid h-[29.797px] left-[25px] top-[218.5px] w-[262.5px]" data-name="Container">
                <BackgroundImage7 additionalClassNames="absolute left-0 top-[14px]">
                  <g clipPath="url(#clip0_22_2337)" id="Icon">
                    <path d={svgPaths.p38fbf2c0} id="Vector" stroke="var(--stroke-0, #05DF72)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
                    <path d={svgPaths.pd7eb500} id="Vector_2" stroke="var(--stroke-0, #05DF72)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
                  </g>
                  <defs>
                    <clipPath id="clip0_22_2337">
                      <rect fill="white" height="14" width="14" />
                    </clipPath>
                  </defs>
                </BackgroundImage7>
                <ParagraphBackgroundImageAndText1 text="Acceptable - Room for improvement" additionalClassNames="w-[193.688px]" />
              </div>
            </div>
            <div className="[grid-area:1_/_3] bg-[rgba(255,255,255,0.03)] h-[273.297px] justify-self-stretch relative rounded-[14px] shrink-0" data-name="MetricCard">
              <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.08)] border-solid inset-0 pointer-events-none rounded-[14px]" />
              <div className="absolute content-stretch flex h-[50px] items-center justify-between left-[25px] top-[25px] w-[262.5px]" data-name="Container">
                <ContainerBackgroundImage3>
                  <div className="h-[32px] overflow-clip relative shrink-0 w-full" data-name="Icon">
                    <div className="absolute bottom-[41.67%] left-1/2 right-[33.33%] top-[41.67%]" data-name="Vector">
                      <div className="absolute inset-[-25%]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
                          <path d={svgPaths.p9f15b00} id="Vector" stroke="var(--stroke-0, #C27AFF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                        </svg>
                      </div>
                    </div>
                    <div className="absolute inset-[16.66%_8.33%_20.83%_8.33%]" data-name="Vector">
                      <div className="absolute inset-[-6.67%_-5%]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 29.3333 22.6675">
                          <path d={svgPaths.p367dea80} id="Vector" stroke="var(--stroke-0, #C27AFF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </ContainerBackgroundImage3>
                <ContainerBackgroundImage4 additionalClassNames="w-[49.016px]">
                  <IconBackgroundImage1 />
                  <TextBackgroundImageAndText1 text="+8" />
                </ContainerBackgroundImage4>
              </div>
              <HeadingBackgroundImageAndText text="Speaking Pace" />
              <ContainerBackgroundImageAndText1 text="142 WPM" />
              <div className="absolute content-stretch flex flex-col gap-[6px] h-[30.5px] items-start left-[25px] top-[176px] w-[262.5px]" data-name="Container">
                <div className="bg-[rgba(255,255,255,0.1)] h-[8px] relative rounded-[3.35544e+07px] shrink-0 w-full" data-name="Container">
                  <div className="overflow-clip rounded-[inherit] size-full">
                    <div className="content-stretch flex flex-col items-start pl-0 pr-[13.125px] py-0 relative size-full">
                      <div className="bg-gradient-to-r from-[#ad46ff] h-[8px] rounded-[3.35544e+07px] shrink-0 to-[#00b8db] w-full" data-name="Container" />
                    </div>
                  </div>
                </div>
                <ParagraphBackgroundImageAndText text="Ideal: 140-160" />
              </div>
              <div className="absolute border-[1px_0px_0px] border-[rgba(255,255,255,0.05)] border-solid h-[29.797px] left-[25px] top-[218.5px] w-[262.5px]" data-name="Container">
                <BackgroundImage7 additionalClassNames="absolute left-0 top-[14px]">
                  <g clipPath="url(#clip0_22_2301)" id="Icon">
                    <path d={svgPaths.p65b1540} id="Vector" stroke="var(--stroke-0, #05DF72)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
                    <path d={svgPaths.pd7eb500} id="Vector_2" stroke="var(--stroke-0, #05DF72)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
                  </g>
                  <defs>
                    <clipPath id="clip0_22_2301">
                      <rect fill="white" height="14" width="14" />
                    </clipPath>
                  </defs>
                </BackgroundImage7>
                <ParagraphBackgroundImageAndText1 text="Perfect pace - Easy to follow" additionalClassNames="w-[149.063px]" />
              </div>
            </div>
            <div className="[grid-area:1_/_4] bg-[rgba(255,255,255,0.03)] h-[273.297px] justify-self-stretch relative rounded-[14px] shrink-0" data-name="MetricCard">
              <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.08)] border-solid inset-0 pointer-events-none rounded-[14px]" />
              <div className="absolute content-stretch flex h-[50px] items-center justify-between left-[25px] top-[25px] w-[262.5px]" data-name="Container">
                <ContainerBackgroundImage3>
                  <div className="h-[32px] overflow-clip relative shrink-0 w-full" data-name="Icon">
                    <div className="absolute bottom-[54.17%] left-[58.33%] right-1/4 top-[16.67%]" data-name="Vector">
                      <div className="absolute inset-[-14.29%_-25%]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 12">
                          <path d={svgPaths.p3a154a00} id="Vector" stroke="var(--stroke-0, #C27AFF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                        </svg>
                      </div>
                    </div>
                    <div className="absolute inset-[8.33%_41.67%_58.33%_41.67%]" data-name="Vector">
                      <div className="absolute inset-[-12.5%_-25%]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 13.3333">
                          <path d={svgPaths.p29b29d00} id="Vector" stroke="var(--stroke-0, #C27AFF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                        </svg>
                      </div>
                    </div>
                    <div className="absolute bottom-[41.67%] left-1/4 right-[58.33%] top-[16.67%]" data-name="Vector">
                      <div className="absolute inset-[-10%_-25%]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 16">
                          <path d={svgPaths.paf5a280} id="Vector" stroke="var(--stroke-0, #C27AFF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                        </svg>
                      </div>
                    </div>
                    <div className="absolute bottom-[8.33%] left-[7.89%] right-[8.33%] top-1/4" data-name="Vector">
                      <div className="absolute inset-[-6.25%_-4.97%]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 29.4741 24">
                          <path d={svgPaths.p449da00} id="Vector" stroke="var(--stroke-0, #C27AFF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </ContainerBackgroundImage3>
                <ContainerBackgroundImage4 additionalClassNames="w-[49.016px]">
                  <IconBackgroundImage1 />
                  <TextBackgroundImageAndText1 text="+2" />
                </ContainerBackgroundImage4>
              </div>
              <HeadingBackgroundImageAndText text="Nervous Gestures" />
              <ContainerBackgroundImageAndText2 text="6" />
              <div className="absolute content-stretch flex flex-col gap-[6px] h-[30.5px] items-start left-[25px] top-[176px] w-[262.5px]" data-name="Container">
                <div className="bg-[rgba(255,255,255,0.1)] content-stretch flex flex-col h-[8px] items-start overflow-clip relative rounded-[3.35544e+07px] shrink-0 w-full" data-name="Container">
                  <div className="bg-gradient-to-r from-[#ad46ff] h-[8px] rounded-[3.35544e+07px] shrink-0 to-[#00b8db] w-full" data-name="Container" />
                </div>
                <BackgroundImage6>{`Target: <5`}</BackgroundImage6>
              </div>
              <div className="absolute border-[1px_0px_0px] border-[rgba(255,255,255,0.05)] border-solid h-[29.797px] left-[25px] top-[218.5px] w-[262.5px]" data-name="Container">
                <BackgroundImage7 additionalClassNames="absolute left-0 top-[14px]">
                  <g clipPath="url(#clip0_22_2343)" id="Icon">
                    <path d={svgPaths.pc012c00} id="Vector" stroke="var(--stroke-0, #FFB900)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
                    <path d="M7 4.66667V7" id="Vector_2" stroke="var(--stroke-0, #FFB900)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
                    <path d="M7 9.33333H7.00583" id="Vector_3" stroke="var(--stroke-0, #FFB900)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
                  </g>
                  <defs>
                    <clipPath id="clip0_22_2343">
                      <rect fill="white" height="14" width="14" />
                    </clipPath>
                  </defs>
                </BackgroundImage7>
                <ParagraphBackgroundImageAndText1 text="Try standing still for 3+ seconds" additionalClassNames="w-[167.953px]" />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bg-[rgba(255,255,255,0.03)] h-[76px] left-[40px] rounded-[16px] top-[1812.8px] w-[1322px]" data-name="TranscriptPanel">
          <div className="content-stretch flex flex-col items-start overflow-clip p-px relative rounded-[inherit] size-full">
            <div className="h-[74px] relative shrink-0 w-full" data-name="Button">
              <div className="flex flex-row items-center size-full">
                <div className="content-stretch flex items-center justify-between px-[32px] py-0 relative size-full">
                  <ContainerBackgroundImage2 additionalClassNames="h-[24px] w-[217.531px]">
                    <IconBackgroundImage4>
                      <path d={svgPaths.p31172880} id="Vector" stroke="var(--stroke-0, #C27AFF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                      <path d={svgPaths.p3abdf300} id="Vector_2" stroke="var(--stroke-0, #C27AFF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                      <path d="M8.33333 7.5H6.66667" id="Vector_3" stroke="var(--stroke-0, #C27AFF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                      <path d="M13.3333 10.8333H6.66667" id="Vector_4" stroke="var(--stroke-0, #C27AFF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                      <path d="M13.3333 14.1667H6.66667" id="Vector_5" stroke="var(--stroke-0, #C27AFF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                    </IconBackgroundImage4>
                    <BackgroundImage2 additionalClassNames="h-[24px]">
                      <p className="absolute font-['Arial:Bold',sans-serif] leading-[24px] left-[51.5px] not-italic text-[16px] text-center text-nowrap text-white top-[-2px] translate-x-[-50%]">Full Transcript</p>
                    </BackgroundImage2>
                    <BackgroundImage3 additionalClassNames="h-[21px] w-[72.313px]">
                      <p className="absolute font-['Arial:Regular',sans-serif] leading-[21px] left-[36.5px] not-italic text-[#99a1af] text-[14px] text-center top-[-1px] translate-x-[-50%] w-[73px]">(193 words)</p>
                    </BackgroundImage3>
                  </ContainerBackgroundImage2>
                  <ContainerBackgroundImage2 additionalClassNames="h-[26px] w-[168.281px]">
                    <BackgroundImage2 additionalClassNames="bg-[rgba(251,44,54,0.2)] h-[26px] rounded-[3.35544e+07px]">
                      <p className="absolute font-['Arial:Bold',sans-serif] leading-[18px] left-[66.5px] not-italic text-[#ff6467] text-[12px] text-center top-[3px] translate-x-[-50%] w-[109px]">4 issues highlighted</p>
                    </BackgroundImage2>
                    <BackgroundImage1>
                      <path d="M6 9L12 15L18 9" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </BackgroundImage1>
                  </ContainerBackgroundImage2>
                </div>
              </div>
            </div>
          </div>
          <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.08)] border-solid inset-0 pointer-events-none rounded-[16px]" />
        </div>
        <div className="absolute content-stretch flex flex-col gap-[16px] h-[749.5px] items-start left-[588px] top-[367px] w-[793.188px]" data-name="CoachingCards">
          <div className="h-[33.5px] relative shrink-0 w-[793.188px]" data-name="Container">
            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between relative size-full">
              <div className="h-[27px] relative shrink-0 w-[267.422px]" data-name="Container">
                <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
                  <BackgroundImage2 additionalClassNames="h-[27px]">
                    <p className="absolute font-['Arial:Bold',sans-serif] leading-[27px] left-0 not-italic text-[18px] text-nowrap text-white top-[-2px]">Coaching Insights</p>
                  </BackgroundImage2>
                  <BackgroundImage3 additionalClassNames="h-[21px] w-[114.563px]">
                    <p className="absolute font-['Arial:Regular',sans-serif] leading-[21px] left-[10.14px] not-italic text-[#99a1af] text-[14px] top-[-1.25px] w-[171px]">(5 issues detected)</p>
                  </BackgroundImage3>
                </div>
              </div>
              <div className="bg-[rgba(255,255,255,0.05)] h-[33.5px] relative rounded-[10px] shrink-0 w-[104.203px]" data-name="Button">
                <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none rounded-[10px]" />
                <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                  <p className="absolute font-['Arial:Regular',sans-serif] leading-[19.5px] left-[40px] not-italic text-[#d1d5dc] text-[13px] text-center text-nowrap top-[6px] translate-x-[-50%]">All Issues</p>
                  <BackgroundImage additionalClassNames="absolute left-[75.2px] top-[8.75px]">
                    <path d="M4 6L8 10L12 6" id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                  </BackgroundImage>
                </div>
              </div>
            </div>
          </div>
          <div className="h-[503px] relative shrink-0 w-[793px]" data-name="Container">
            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-x-clip overflow-y-auto pl-0 pr-[22px] py-0 relative size-full">
              <div className="bg-[rgba(255,255,255,0.05)] h-[362px] relative rounded-[14px] shrink-0 w-[771px]" data-name="CoachingCard">
                <div aria-hidden="true" className="absolute border-2 border-[#fb2c36] border-solid inset-0 pointer-events-none rounded-[14px]" />
                <div className="absolute bg-[rgba(251,44,54,0.2)] border border-[#fb2c36] border-solid h-[28px] left-[26px] rounded-[3.35544e+07px] top-[26.5px] w-[104px]" data-name="Container">
                  <p className="absolute font-['Arial:Black',sans-serif] leading-[18px] left-[12px] not-italic text-[#ff6467] text-[12px] text-nowrap top-[3px]">❌ CRITICAL</p>
                </div>
                <div className="absolute bg-[rgba(255,255,255,0.05)] content-stretch flex gap-[6px] h-[27.5px] items-center left-[660.94px] px-[8px] py-0 rounded-[8px] top-[26px] w-[78.25px]" data-name="Container">
                  <IconBackgroundImage2 />
                  <TextBackgroundImageAndText2 text="⏱ 0:15" />
                </div>
                <div className="absolute content-stretch flex h-[15px] items-start left-[26px] top-[72px] w-[136.563px]" data-name="Text">
                  <p className="font-['Arial:Black',sans-serif] leading-[16.5px] not-italic relative shrink-0 text-[#c27aff] text-[11px] text-nowrap tracking-[0.55px] uppercase">EMOTIONAL MISMATCH</p>
                </div>
                <div className="absolute content-stretch flex flex-col gap-[4px] h-[44.5px] items-start left-[26px] top-[102px] w-[719.188px]" data-name="Container">
                  <ParagraphBackgroundImageAndText2 text="You said:" />
                  <div className="h-[22.5px] relative shrink-0 w-full" data-name="Paragraph">
                    <div aria-hidden="true" className="absolute border-[0px_0px_0px_4px] border-[rgba(173,70,255,0.3)] border-solid inset-0 pointer-events-none" />
                    <p className="absolute font-['Arial:Bold_Italic',sans-serif] italic leading-[22.5px] left-[16px] text-[20px] text-white top-[-0.5px] w-[465px]">{`"We're incredibly thrilled about our Q4 results"`}</p>
                  </div>
                </div>
                <div className="absolute bg-[rgba(0,184,219,0.1)] content-stretch flex flex-col gap-[8px] h-[96px] items-start left-[26px] pb-0 pl-[16px] pr-[12px] pt-[12px] rounded-br-[10px] rounded-tr-[10px] top-[195.5px] w-[714px]" data-name="Container">
                  <div aria-hidden="true" className="absolute border-[#00b8db] border-[0px_0px_0px_4px] border-solid inset-0 pointer-events-none rounded-br-[10px] rounded-tr-[10px]" />
                  <div className="content-stretch flex gap-[8px] h-[19.5px] items-center relative shrink-0 w-full" data-name="Container">
                    <IconBackgroundImage3 />
                    <BackgroundImage3 additionalClassNames="h-[19.5px] w-[64.219px]">
                      <p className="absolute font-['Arial:Black',sans-serif] leading-[19.5px] left-0 not-italic text-[#53eafd] text-[13px] text-nowrap top-[-1px]">How to fix:</p>
                    </BackgroundImage3>
                  </div>
                  <div className="h-[44.781px] relative shrink-0 w-full" data-name="Paragraph">
                    <p className="absolute font-['Arial:Bold',sans-serif] leading-[22.4px] left-0 not-italic text-[#cefafe] text-[14px] top-[-1.5px] w-[680px]">Smile with teeth and lean forward 10° when expressing enthusiasm. Practice in a mirror until the expression feels natural.</p>
                  </div>
                </div>
                <div className="absolute content-stretch flex h-[39px] items-center left-[26px] top-[304.17px] w-[719.188px]" data-name="Container">
                  <div className="bg-[rgba(173,70,255,0.2)] h-[39px] relative rounded-[10px] shrink-0 w-[714px]" data-name="Button">
                    <div aria-hidden="true" className="absolute border border-[#ad46ff] border-solid inset-0 pointer-events-none rounded-[10px]" />
                    <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                      <p className="absolute font-['Arial:Black',sans-serif] leading-[21px] left-[356.5px] not-italic text-[#dab2ff] text-[14px] text-center text-nowrap top-[10px] translate-x-[-50%]">Jump to Moment →</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-[rgba(255,255,255,0.05)] h-[373.781px] relative rounded-[14px] shrink-0 w-full" data-name="CoachingCard">
                <div aria-hidden="true" className="absolute border-2 border-[#fe9a00] border-solid inset-0 pointer-events-none rounded-[14px]" />
                <div className="absolute content-stretch flex h-[28px] items-start justify-between left-[26px] top-[26px] w-[719.188px]" data-name="Container">
                  <ContainerBackgroundImageAndText3 text="⚠️ WARNING" />
                  <ContainerBackgroundImage5 additionalClassNames="w-[80.5px]">
                    <IconBackgroundImage2 />
                    <TextBackgroundImageAndText3 text="⏱ 0:45" />
                  </ContainerBackgroundImage5>
                </div>
                <TextBackgroundImageAndText4 text="MISSING GESTURE" additionalClassNames="w-[104.906px]" />
                <div className="absolute content-stretch flex flex-col gap-[4px] h-[44.5px] items-start left-[26px] top-[102px] w-[719.188px]" data-name="Container">
                  <ParagraphBackgroundImageAndText2 text="You said:" />
                  <div className="h-[22.5px] relative shrink-0 w-full" data-name="Paragraph">
                    <div aria-hidden="true" className="absolute border-[0px_0px_0px_4px] border-[rgba(173,70,255,0.3)] border-solid inset-0 pointer-events-none" />
                    <p className="absolute font-['Arial:Italic',sans-serif] italic leading-[22.5px] left-[16px] text-[15px] text-white top-[-1px] w-[204px]">{`"Look at this chart on the right"`}</p>
                  </div>
                </div>
                <div className="absolute content-stretch flex flex-col gap-[4px] h-[44.391px] items-start left-[26px] top-[158.5px] w-[719.188px]" data-name="Container">
                  <ParagraphBackgroundImageAndText2 text="But:" />
                  <ParagraphBackgroundImageAndText3 text="No hand movement or pointing gesture detected when referencing visual elements." />
                </div>
                <div className="absolute bg-[rgba(0,184,219,0.1)] content-stretch flex flex-col gap-[8px] h-[73.891px] items-start left-[26px] pb-0 pl-[16px] pr-[12px] pt-[12px] rounded-br-[10px] rounded-tr-[10px] top-[218.89px] w-[719.188px]" data-name="Container">
                  <div aria-hidden="true" className="absolute border-[#00b8db] border-[0px_0px_0px_4px] border-solid inset-0 pointer-events-none rounded-br-[10px] rounded-tr-[10px]" />
                  <ContainerBackgroundImage />
                  <ParagraphBackgroundImageAndText4 text="Point at the screen or use a laser pointer to guide audience attention. Physical gestures reinforce verbal cues." />
                </div>
                <ContainerBackgroundImage1 additionalClassNames="top-[308.78px]" />
                <div className="absolute bg-gradient-to-r from-[rgba(254,154,0,0.05)] h-[369.781px] left-[2px] to-[rgba(0,0,0,0)] top-[2px] w-[4px]" data-name="Container" />
                <IconBackgroundImage5>
                  <path d={svgPaths.p29d229c0} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                  <path d={svgPaths.p305e83d8} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                  <path d={svgPaths.p8890890} id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                  <path d={svgPaths.p398a030} id="Vector_4" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                </IconBackgroundImage5>
                <ContainerBackgroundImageAndText4 text="92% confidence" additionalClassNames="top-[344.78px]" />
              </div>
              <div className="bg-[rgba(255,255,255,0.05)] h-[295.281px] relative rounded-[14px] shrink-0 w-full" data-name="CoachingCard">
                <div aria-hidden="true" className="absolute border-2 border-[#fb2c36] border-solid inset-0 pointer-events-none rounded-[14px]" />
                <div className="absolute content-stretch flex h-[28px] items-start justify-between left-[26px] top-[26px] w-[719.188px]" data-name="Container">
                  <div className="bg-[rgba(251,44,54,0.2)] h-[28px] relative rounded-[3.35544e+07px] shrink-0 w-[95.703px]" data-name="Container">
                    <div aria-hidden="true" className="absolute border border-[#fb2c36] border-solid inset-0 pointer-events-none rounded-[3.35544e+07px]" />
                    <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                      <p className="absolute font-['Arial:Bold',sans-serif] leading-[18px] left-[13px] not-italic text-[#ff6467] text-[12px] text-nowrap top-[4px]">❌ CRITICAL</p>
                    </div>
                  </div>
                  <ContainerBackgroundImage5 additionalClassNames="w-[78.516px]">
                    <IconBackgroundImage2 />
                    <TextBackgroundImageAndText2 text="⏱ 1:45" />
                  </ContainerBackgroundImage5>
                </div>
                <TextBackgroundImageAndText4 text="PACING MISMATCH" additionalClassNames="w-[110.844px]" />
                <BackgroundImageAndText text="Slide 4 contains 127 words but you only spent 14 seconds on it. Audience cannot read and listen simultaneously." />
                <div className="absolute bg-[rgba(0,184,219,0.1)] content-stretch flex flex-col gap-[8px] h-[73.891px] items-start left-[26px] pb-0 pl-[16px] pr-[12px] pt-[12px] rounded-br-[10px] rounded-tr-[10px] top-[140.39px] w-[719.188px]" data-name="Container">
                  <div aria-hidden="true" className="absolute border-[#00b8db] border-[0px_0px_0px_4px] border-solid inset-0 pointer-events-none rounded-br-[10px] rounded-tr-[10px]" />
                  <ContainerBackgroundImage />
                  <ParagraphBackgroundImageAndText4 text="Either cut slide text to 50 words or extend your explanation to ~45 seconds. Use the 1-second-per-word rule." />
                </div>
                <ContainerBackgroundImage1 additionalClassNames="top-[230.28px]" />
                <div className="absolute bg-gradient-to-r from-[rgba(251,44,54,0.05)] h-[291.281px] left-[2px] to-[rgba(0,0,0,0)] top-[2px] w-[4px]" data-name="Container" />
                <IconBackgroundImage5>
                  <path d="M24 12V24L32 28" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                  <path d={svgPaths.p1f337080} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                </IconBackgroundImage5>
                <ContainerBackgroundImageAndText4 text="95% confidence" additionalClassNames="top-[266.28px]" />
              </div>
              <div className="bg-[rgba(255,255,255,0.05)] h-[317.672px] relative rounded-[14px] shrink-0 w-full" data-name="CoachingCard">
                <div aria-hidden="true" className="absolute border-2 border-[#fe9a00] border-solid inset-0 pointer-events-none rounded-[14px]" />
                <div className="absolute content-stretch flex h-[28px] items-start justify-between left-[26px] top-[26px] w-[719.188px]" data-name="Container">
                  <ContainerBackgroundImageAndText3 text="⚠️ WARNING" />
                  <ContainerBackgroundImage5 additionalClassNames="w-[78.25px]">
                    <IconBackgroundImage2 />
                    <TextBackgroundImageAndText2 text="⏱ 2:15" />
                  </ContainerBackgroundImage5>
                </div>
                <TextBackgroundImageAndText4 text="EYE CONTACT LOSS" additionalClassNames="w-[109.594px]" />
                <BackgroundImageAndText text="Looked at floor for 8 consecutive seconds during key value proposition statement." />
                <div className="absolute bg-[rgba(0,184,219,0.1)] content-stretch flex flex-col gap-[8px] h-[96.281px] items-start left-[26px] pb-0 pl-[16px] pr-[12px] pt-[12px] rounded-br-[10px] rounded-tr-[10px] top-[140.39px] w-[719.188px]" data-name="Container">
                  <div aria-hidden="true" className="absolute border-[#00b8db] border-[0px_0px_0px_4px] border-solid inset-0 pointer-events-none rounded-br-[10px] rounded-tr-[10px]" />
                  <ContainerBackgroundImage />
                  <div className="h-[44.781px] relative shrink-0 w-full" data-name="Paragraph">
                    <p className="absolute font-['Arial:Regular',sans-serif] leading-[22.4px] left-0 not-italic text-[#cefafe] text-[14px] top-[-2px] w-[684px]">Practice looking at the camera lens (simulates audience eye contact). Place a sticky note with a smiley face near the lens as a reminder.</p>
                  </div>
                </div>
                <ContainerBackgroundImage1 additionalClassNames="top-[252.67px]" />
                <div className="absolute bg-gradient-to-r from-[rgba(254,154,0,0.05)] h-[313.672px] left-[2px] to-[rgba(0,0,0,0)] top-[2px] w-[4px]" data-name="Container" />
                <IconBackgroundImage5>
                  <path d={svgPaths.p39036380} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                  <path d={svgPaths.p138fbff0} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                </IconBackgroundImage5>
                <ContainerBackgroundImageAndText4 text="89% confidence" additionalClassNames="top-[288.67px]" />
              </div>
              <div className="bg-[rgba(255,255,255,0.05)] h-[295.281px] relative rounded-[14px] shrink-0 w-full" data-name="CoachingCard">
                <div aria-hidden="true" className="absolute border-2 border-[rgba(0,201,80,0.5)] border-solid inset-0 pointer-events-none rounded-[14px]" />
                <div className="absolute content-stretch flex h-[28px] items-start justify-between left-[26px] top-[26px] w-[719.188px]" data-name="Container">
                  <ContainerBackgroundImageAndText5 text="✓ TIP" additionalClassNames="bg-[rgba(0,201,80,0.1)] w-[55.422px]" />
                  <ContainerBackgroundImage5 additionalClassNames="w-[79.984px]">
                    <IconBackgroundImage2 />
                    <BackgroundImage2 additionalClassNames="h-[19.5px]">
                      <p className="absolute font-['Arial:Regular',sans-serif] leading-[19.5px] left-0 not-italic text-[#99a1af] text-[13px] top-[-1px] w-[46px]">⏱ 0:27</p>
                    </BackgroundImage2>
                  </ContainerBackgroundImage5>
                </div>
                <TextBackgroundImageAndText4 text="FILLER WORDS" additionalClassNames="w-[83.984px]" />
                <BackgroundImage5>{`Used 'um' 3 times in 20 seconds during the opening introduction.`}</BackgroundImage5>
                <div className="absolute bg-[rgba(0,184,219,0.1)] content-stretch flex flex-col gap-[8px] h-[73.891px] items-start left-[26px] pb-0 pl-[16px] pr-[12px] pt-[12px] rounded-br-[10px] rounded-tr-[10px] top-[140.39px] w-[719.188px]" data-name="Container">
                  <div aria-hidden="true" className="absolute border-[#00b8db] border-[0px_0px_0px_4px] border-solid inset-0 pointer-events-none rounded-br-[10px] rounded-tr-[10px]" />
                  <ContainerBackgroundImage />
                  <ParagraphBackgroundImageAndText4 text="Pause instead of filling silence. Silence shows confidence. Practice replacing filler words with 2-second pauses." />
                </div>
                <ContainerBackgroundImage1 additionalClassNames="top-[230.28px]" />
                <div className="absolute bg-gradient-to-r from-[rgba(0,201,80,0.05)] h-[291.281px] left-[2px] to-[rgba(0,0,0,0)] top-[2px] w-[4px]" data-name="Container" />
                <IconBackgroundImage5>
                  <path d={svgPaths.p2d95a600} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                </IconBackgroundImage5>
                <ContainerBackgroundImageAndText4 text="78% confidence" additionalClassNames="top-[266.28px]" />
              </div>
              <div className="bg-[rgba(255,255,255,0.05)] h-[373.781px] relative rounded-[14px] shrink-0 w-full" data-name="CoachingCard">
                <div aria-hidden="true" className="absolute border-2 border-[rgba(0,201,80,0.5)] border-solid inset-0 pointer-events-none rounded-[14px]" />
                <div className="absolute content-stretch flex h-[28px] items-start justify-between left-[26px] top-[26px] w-[719.188px]" data-name="Container">
                  <ContainerBackgroundImageAndText5 text="✓ EXCELLENT" additionalClassNames="bg-[rgba(0,201,80,0.2)] w-[99.344px]" />
                  <ContainerBackgroundImage5 additionalClassNames="w-[80.234px]">
                    <IconBackgroundImage2 />
                    <TextBackgroundImageAndText3 text="⏱ 2:50" />
                  </ContainerBackgroundImage5>
                </div>
                <TextBackgroundImageAndText4 text="POSITIVE MOMENT" additionalClassNames="w-[109.547px]" />
                <div className="absolute content-stretch flex flex-col gap-[4px] h-[44.5px] items-start left-[26px] top-[102px] w-[719.188px]" data-name="Container">
                  <ParagraphBackgroundImageAndText2 text="You said:" />
                  <div className="h-[22.5px] relative shrink-0 w-full" data-name="Paragraph">
                    <div aria-hidden="true" className="absolute border-[0px_0px_0px_4px] border-[rgba(173,70,255,0.3)] border-solid inset-0 pointer-events-none" />
                    <p className="absolute font-['Arial:Italic',sans-serif] italic leading-[22.5px] left-[16px] text-[15px] text-white top-[-1px] w-[413px]">{`"Our solution saves companies an average of $50,000 annually"`}</p>
                  </div>
                </div>
                <div className="absolute content-stretch flex flex-col gap-[4px] h-[44.391px] items-start left-[26px] top-[158.5px] w-[719.188px]" data-name="Container">
                  <ParagraphBackgroundImageAndText2 text="But:" />
                  <ParagraphBackgroundImageAndText3 text="Perfect emotional alignment! Confident tone matched with genuine smile and open body language." />
                </div>
                <div className="absolute bg-[rgba(0,184,219,0.1)] content-stretch flex flex-col gap-[8px] h-[73.891px] items-start left-[26px] pb-0 pl-[16px] pr-[12px] pt-[12px] rounded-br-[10px] rounded-tr-[10px] top-[218.89px] w-[719.188px]" data-name="Container">
                  <div aria-hidden="true" className="absolute border-[#00b8db] border-[0px_0px_0px_4px] border-solid inset-0 pointer-events-none rounded-br-[10px] rounded-tr-[10px]" />
                  <div className="content-stretch flex gap-[8px] h-[19.5px] items-center relative shrink-0 w-full" data-name="Container">
                    <IconBackgroundImage3 />
                    <TextBackgroundImageAndText5 text="Keep it up:" additionalClassNames="w-[63.234px]" />
                  </div>
                  <ParagraphBackgroundImageAndText4 text="This is your peak performance - keep this energy throughout. Your conviction was palpable and persuasive." />
                </div>
                <div className="absolute bg-[rgba(173,70,255,0.2)] border border-[#ad46ff] border-solid h-[39px] left-[26px] rounded-[10px] top-[308.78px] w-[719.188px]" data-name="Button">
                  <p className="absolute font-['Arial:Regular',sans-serif] leading-[21px] left-[359.14px] not-italic text-[#dab2ff] text-[14px] text-center text-nowrap top-[7px] translate-x-[-50%]">Jump to Moment →</p>
                </div>
                <div className="absolute bg-gradient-to-r from-[rgba(0,201,80,0.05)] h-[369.781px] left-[2px] to-[rgba(0,0,0,0)] top-[2px] w-[4px]" data-name="Container" />
                <IconBackgroundImage5>
                  <path d={svgPaths.p1e8f5000} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                  <path d="M18 22L24 28L44 8" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                </IconBackgroundImage5>
                <ContainerBackgroundImageAndText4 text="94% confidence" additionalClassNames="top-[344.78px]" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute h-[962px] left-0 opacity-[0.03] top-0 w-[1402px]" data-name="ResultsPage">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[13.51%] left-0 max-w-none top-0 w-[10.7%]" src={imgResultsPage} />
        </div>
        <div className="absolute h-0 left-[88px] top-[962px] w-[1226px]">
          <div className="absolute inset-[-7px_0_0_0]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1226 7">
              <line id="Line 1" stroke="var(--stroke-0, white)" strokeWidth="7" x2="1226" y1="3.5" y2="3.5" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}