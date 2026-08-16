/**
 * Brand marks for the share targets.
 *
 * These are hand-written rather than imported, for the same reason the header
 * hand-writes its GitHub mark: the icon library carries interface icons, not
 * company logos. Every one of them draws with fill-current and no colour of its
 * own, so a share row stays monochrome and keeps to the design tokens. Brand
 * colours would be the only hardcoded colours in the codebase.
 *
 * Each is a 24-unit square, so they all sit at the same visual weight next to
 * the icons that do come from the library.
 */

type BrandIconProps = {
  className?: string
}

/** Marks every mark as decoration. The control around it carries the label. */
function BrandIcon({
  className,
  children,
}: BrandIconProps & { children: React.ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className ?? "size-4 fill-current"}
    >
      {children}
    </svg>
  )
}

export function XIcon(props: BrandIconProps) {
  return (
    <BrandIcon {...props}>
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </BrandIcon>
  )
}

export function BlueskyIcon(props: BrandIconProps) {
  return (
    <BrandIcon {...props}>
      <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565C.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479c.815 2.736 3.713 3.66 6.383 3.364c.136-.02.275-.039.415-.056c-.138.022-.276.04-.415.056c-3.912.58-7.387 2.005-2.83 7.078c5.013 5.19 6.87-1.113 7.823-4.308c.953 3.195 2.05 9.271 7.733 4.308c4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056c2.67.297 5.568-.628 6.383-3.364c.246-.828.624-5.789.624-6.478c0-.69-.139-1.861-.902-2.206c-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z" />
    </BrandIcon>
  )
}

export function LinkedInIcon(props: BrandIconProps) {
  return (
    <BrandIcon {...props}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
    </BrandIcon>
  )
}

export function HackerNewsIcon(props: BrandIconProps) {
  return (
    <BrandIcon {...props}>
      <path d="M0 24V0h24v24H0zM6.951 5.896l4.112 7.708v5.064h1.583v-4.972l4.148-7.799h-1.749l-2.457 4.875c-.372.745-.688 1.434-.688 1.434s-.297-.708-.651-1.434L8.831 5.896h-1.88z" />
    </BrandIcon>
  )
}

export function RedditIcon(props: BrandIconProps) {
  return (
    <BrandIcon {...props}>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 3.314 1.343 6.314 3.515 8.485l-2.286 2.286A.72.72 0 0 0 1.738 24H12c6.627 0 12-5.373 12-12S18.627 0 12 0Zm4.388 3.199a1.999 1.999 0 1 1-1.947 2.46v.002a2.37 2.37 0 0 0-2.032 2.341v.007c1.352.024 2.593.408 3.583 1.023a2.366 2.366 0 0 1 1.591-.619 2.37 2.37 0 1 1 .967 4.535 3.85 3.85 0 0 1 .026.463c0 2.602-2.902 4.706-6.482 4.706-3.579 0-6.482-2.104-6.482-4.706 0-.159.01-.316.028-.472a2.371 2.371 0 1 1 .996-4.526c.965 0 1.83.554 2.239 1.4.998-.61 2.245-.98 3.61-.994v-.014a3.291 3.291 0 0 1 2.941-3.257 2 2 0 0 1 1.945-1.545Zm-8.777 9.86a1.185 1.185 0 0 0-.822 2.04 1.185 1.185 0 0 0 2.007-.855 1.185 1.185 0 0 0-1.185-1.185Zm8.77 0a1.185 1.185 0 0 0-.808 2.05 1.185 1.185 0 0 0 2.004-.865 1.185 1.185 0 0 0-1.196-1.185Zm-4.394 5.406c-1.209 0-2.367.052-3.44.144a.343.343 0 0 0-.263.535c.727 1.021 1.99 1.694 3.703 1.694 1.712 0 2.976-.673 3.703-1.694a.343.343 0 0 0-.264-.535c-1.072-.092-2.23-.144-3.439-.144Z" />
    </BrandIcon>
  )
}
