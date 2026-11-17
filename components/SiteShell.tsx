import type { ReactElement, ReactNode } from "react";

type SiteShellProps = {
  children: ReactNode;
};

export function SiteShell(props: SiteShellProps): ReactElement {
  return (
    <div className="relative min-h-screen">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[42rem] bg-[radial-gradient(ellipse_at_top,rgba(232,161,90,0.2),transparent_58%)]"
      />
      {props.children}
    </div>
  );
}
