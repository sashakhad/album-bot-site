import type { MouseEvent, ReactElement } from "react";

/**
 * TODO: point this at the real beta invite URL before anyone is sent here.
 * The href is the string "TODO" on purpose. Do not invent an email or a URL.
 */
export const INVITE_HREF = "TODO";

type InviteVariant = "solid" | "large";

type InviteLinkProps = {
  variant?: InviteVariant;
};

function preventInviteNavigation(event: MouseEvent<HTMLAnchorElement>): void {
  event.preventDefault();
}

function classNameFor(variant: InviteVariant): string {
  const shared =
    "inline-flex items-center justify-center rounded-full bg-amber font-semibold text-ink transition hover:bg-amber-bright focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber";
  if (variant === "large") {
    return `${shared} px-6 py-3 text-base`;
  }
  return `${shared} px-4 py-3 text-sm`;
}

export function InviteLink(props: InviteLinkProps): ReactElement {
  const variant = props.variant ?? "solid";

  return (
    <a
      href={INVITE_HREF}
      data-todo="invite-href"
      title="Invite link isn’t up yet"
      className={classNameFor(variant)}
      onClick={preventInviteNavigation}
    >
      Request an invite
    </a>
  );
}
