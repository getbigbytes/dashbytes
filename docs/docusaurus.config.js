/** @type {import('@docusaurus/types').DocusaurusConfig} */
const path = require('path');

module.exports = {
    title: 'Documentation | Clairdash',
    tagline:
        'Documentation. Learn how to use Clairdash and setup the BI tool for the modern data stack.',
    url: 'https://docs.clairdash.com',
    baseUrl: '/',
    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',
    favicon: 'img/favicon-32x32.png', // TODO update
    organizationName: 'clairdash', // Usually your GitHub org/user name.
    projectName: 'clairdash', // Usually your repo name.
    plugins: [
        [
            path.resolve(__dirname, 'docusaurus-rudderstack-plugin'),
            {
                dataplaneUrl: process.env.RUDDERSTACK_DATAPLANE_URL,
                writeKey: process.env.RUDDERSTACK_WRITE_KEY,
            },
        ],
        [
            '@docusaurus/plugin-client-redirects',
            {
                redirects: [
                    {
                        to: '/self-host/self-host-clairdash',
                        from: ['/getting-started/install-clairdash'],
                    },
                    {
                        to: '/self-host/customize-deployment/configure-a-slack-app-for-clairdash',
                        from: ['/guides/enable-slack-selfhost'],
                    },
                    {
                        to: '/self-host/customize-deployment/enable-headless-browser-for-clairdash',
                        from: ['/guides/enable-headless-browser-selfhost'],
                    },
                    {
                        to: '/self-host/self-host-clairdash',
                        from: ['/guides/how-to-deploy-to-kubernetes'],
                    },
                    {
                        to: '/self-host/update-clairdash',
                        from: [
                            '/guides/how-to-update-docker-image',
                            '/guides/update-clairdash',
                        ],
                    },
                    {
                        to: '/self-host/customize-deployment/environment-variables',
                        from: ['/references/environmentVariables'],
                    },
                    {
                        to: '/self-host/customize-deployment/configure-clairdash-to-use-external-object-storage',
                        from: ['/guides/enable-cloud-storage'],
                    },
                    {
                        to: '/self-host/self-host-clairdash',
                        from: ['/self-host'],
                    },
                    {
                        to: '/contact/contact_info',
                        from: ['/help-and-contact/contact/contact_info']
                    },
                ],
            },
        ],
    ],
    themes: [
        [
            require.resolve('@easyops-cn/docusaurus-search-local'),
            {
                indexDocs: true,
                indexBlog: false,
                indexPages: true,
            },
        ],
    ],
    themeConfig: {
        navbar: {
            title: 'Clairdash',
            logo: {
                alt: 'clairdash logo',
                src: 'img/logo.png',
            },
            items: [
                {
                    type: 'doc',
                    docId: 'intro',
                    position: 'left',
                    label: 'Docs',
                },
                {
                    to: '/api/v1',
                    position: 'left',
                    label: 'API',
                },
                {
                    label: 'Live demo',
                    href: 'https://demo.clairdash.com/',
                    position: 'left',
                },
                {
                    href: 'https://github.com/clairview/clairdash',
                    position: 'right',
                    className: 'header-github-link',
                    'aria-label': 'GitHub repository',
                },
            ],
        },
        footer: {
            style: 'dark',
            logo: {
                alt: 'Clairdash Logo',
                src: 'img/clairdash-full-darkbg.png',
                href: 'https://clairdash.com',
                width: 570,
            },
            links: [
                {
                    label: 'Community',
                    href: 'https://github.com/clairview/clairdash/discussions',
                },
                {
                    label: 'Blog',
                    href: 'https://www.clairdash.com/blog',
                },
                {
                    label: 'Company',
                    href: 'https://www.clairdash.com/about',
                },
                {
                    label: 'Careers',
                    href: 'https://www.notion.so/clairdash/Clairdash-Job-Board-a2c7d872794b45deb7b76ad68701d750',
                },
                {
                    label: 'Media kit',
                    href: 'https://www.notion.so/clairdash/Clairdash-Media-kit-f4424136bb5a4c8891c0d535dd5e5911',
                },
            ],
            copyright: `Copyright © ${new Date().getFullYear()} Clairdash. Built with Docusaurus.`,
        },
    },
    presets: [
        [
            '@docusaurus/preset-classic',
            {
                docs: {
                    sidebarPath: require.resolve('./sidebars.js'),
                    routeBasePath: '/',
                    // Please change this to your repo.
                    editUrl:
                        'https://github.com/clairview/clairdash/edit/main/docs/',
                },
                theme: {
                    customCss: require.resolve('./src/css/custom.css'),
                },
            },
        ],
        [
            'redocusaurus',
            {
                specs: [
                    {
                        id: 'api-v1',
                        spec: '../packages/backend/src/generated/swagger.json',
                        route: '/api/v1/',
                    },
                ],
                theme: {
                    primaryColor: '#7262FF',
                    options: {
                        // see all options here: https://github.com/Redocly/redoc#redoc-options-object
                        disableSearch: true,
                        hideHostname: true,
                        hideDownloadButton: true,
                    },
                },
            },
        ],
    ],
};
