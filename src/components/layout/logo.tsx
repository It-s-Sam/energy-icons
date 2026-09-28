/**
 * Energy Icons wordmark. The house mark is the supplied logo artwork.
 * In dark mode the black lettering flips to white and the blue house stays blue.
 */
export function Logo() {
  return (
    <img
      src="/brand/logo.png"
      alt=""
      width={1024}
      height={165}
      className="h-[26px] w-auto dark:[filter:invert(1)_hue-rotate(180deg)]"
    />
  );
}
