let jwtDecode;

try {
    jwtDecode = await import('jwt-decode').then((module) => module.default || module.jwtDecode);
} catch (error) {
    console.error('Failed to import jwt-decode:', error);
}

export { jwtDecode };