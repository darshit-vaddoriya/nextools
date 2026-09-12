import React from 'react';

interface AppLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'onClick'> {
  /** Real, absolute-from-root path, this is what search engines follow. */
  href: string;
  /** Client-side navigation to run instead of a full page load. */
  onNavigate: () => void;
}

/**
 * An internal link that is a genuine `<a href>` rather than a button.
 *
 * The app routes with history.pushState, so navigation used to be wired to
 * <button onClick>. That works for people but is invisible to crawlers: with no
 * anchors, every page below the homepage is an orphan and no link signal flows
 * between them. Rendering a real href fixes that, and as a bonus middle-click
 * and ctrl/cmd-click now open tools in a new tab like any other link.
 */
export const AppLink: React.FC<AppLinkProps> = ({ href, onNavigate, children, ...rest }) => (
  <a
    href={href}
    onClick={e => {
      // Defer to the browser for modified clicks (new tab/window) and any
      // non-primary button, so normal link affordances keep working.
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey || e.ctrlKey || e.shiftKey || e.altKey
      ) {
        return;
      }
      e.preventDefault();
      onNavigate();
    }}
    {...rest}
  >
    {children}
  </a>
);
