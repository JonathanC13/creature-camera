const ROLES = {
    ADMIN: 'admin',
    USER: 'user'
}

const PATHS = {
    MANAGE_USERS: {
        text: 'users',
        link: '/users',
        roles: [ROLES.ADMIN]
    },
    MANAGE_CAMERAS: {
        text: 'cameras',
        link: '/cameras',
        roles: [ROLES.ADMIN]
    },
    SETTINGS: {
        text: 'settings',
        link: '/settings',
        roles: [ROLES.ADMIN, ROLES.USER]
    }
}

/*
{
  admin: [{'users', '/users'},{'cameras', '/cameras'},{'settings', '/'}],
  user: [{'settings', '/'}]
}
*/
const ROLE_PATHS = Object.entries(PATHS).reduce(
    (acc, [pathName, { text, link, roles }]) => {
        roles.forEach((role) => {
            if (!acc[role]) {
                acc[role] = []
            }
            acc[role].push({ text, link })
        });
        return acc
    },
    {}
);

export { ROLES, PATHS, ROLE_PATHS }