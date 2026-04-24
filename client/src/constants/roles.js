const ROLES = {
    ADMIN: 'admin',
    USER: 'user'
}

const PATHS = {
    HOME: {
        link: '/',
        roles: [ROLES.ADMIN, ROLES.USER]
    }
}

export { ROLES, PATHS }