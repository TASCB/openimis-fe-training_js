// Split a location into its Region/District/Ward/Village ancestors. `type` is missing on locations
// picked in the form (fe-location's fetchUserDistricts omits it), so depth is the fallback.
const LEVELS = ['R', 'D', 'W', 'V'];

export function locationLevels(location) {
  const ancestors = [];
  for (let node = location; node; node = node.parent) ancestors.unshift(node);
  const levels = {};
  ancestors.forEach((node, depth) => {
    const key = node.type || LEVELS[depth];
    levels[key] = node;
  });
  return levels;
}

export function isPaaComplete(location) {
  return !!locationLevels(location).D;
}
