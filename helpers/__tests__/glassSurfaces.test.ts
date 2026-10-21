/**
 * Regression tests for liquid-glass routing.
 * iOS 26+ uses native GlassView; accent surfaces are flat fill elsewhere.
 * No fake gloss overlays.
 */

function usesNativeGlass(platform: string, liquidGlassAvailable: boolean): boolean {
  return platform === 'ios' && liquidGlassAvailable;
}

function accentFallbackFill(surface: 'frosted' | 'accent', tintColor: string): string | null {
  if (surface !== 'accent') return null;
  return tintColor;
}

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed += 1;
    return;
  }
  failed += 1;
  console.error(`FAIL: ${message}`);
}

assert(usesNativeGlass('ios', true), 'iOS 26+ routes through native GlassView');
assert(!usesNativeGlass('web', true), 'web does not use native GlassView');
assert(!usesNativeGlass('ios', false), 'older iOS uses fallback');

assert(
  accentFallbackFill('accent', '#4a0508') === '#4a0508',
  'accent fallback is a flat brand fill',
);
assert(accentFallbackFill('frosted', '#4a0508') === null, 'frosted uses blur fallback');

console.log(`glassSurfaces: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
