/** @type {import('@docusaurus/types').DocusaurusConfig} */
const path = require('path');

module.exports = {
    title: 'Documentation | Bigbytes',
    tagline:
        'Documentation. Learn how to use Bigbytes and setup the BI tool for the modern data stack.',
    url: 'https://docs.bigbytes.com',
    baseUrl: '/',
    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',
    favicon: 'img/favicon-32x32.png', // TODO update
    organizationName: 'bigbytes', // Usually your GitHub org/user name.
    projectName: 'bigbytes', // Usually your repo name.
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
                        to: '/self-host/self-host-bigbytes',
                        from: ['/getting-started/install-bigbytes'],
                    },
                    {
                        to: '/self-host/customize-deployment/configure-a-slack-app-for-bigbytes',
                        from: ['/guides/enable-slack-selfhost'],
                    },
                    {
                        to: '/self-host/customize-deployment/enable-headless-browser-for-bigbytes',
                        from: ['/guides/enable-headless-browser-selfhost'],
                    },
                    {
                        to: '/self-host/self-host-bigbytes',
                        from: ['/guides/how-to-deploy-to-kubernetes'],
                    },
                    {
                        to: '/self-host/update-bigbytes',
                        from: [
                            '/guides/how-to-update-docker-image',
                            '/guides/update-bigbytes',
                        ],
                    },
                    {
                        to: '/self-host/customize-deployment/environment-variables',
                        from: ['/references/environmentVariables'],
                    },
                    {
                        to: '/self-host/customize-deployment/configure-bigbytes-to-use-external-object-storage',
                        from: ['/guides/enable-cloud-storage'],
                    },
                    {
                        to: '/self-host/self-host-bigbytes',
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
            title: 'Bigbytes',
            logo: {
                alt: 'bigbytes logo',
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
                    href: 'https://demo.bigbytes.com/',
                    position: 'left',
                },
                {
                    href: 'https://github.com/getbigbytes/bigbytes',
                    position: 'right',
                    className: 'header-github-link',
                    'aria-label': 'GitHub repository',
                },
            ],
        },
        footer: {
            style: 'dark',
            logo: {
                alt: 'Bigbytes Logo',
                src: 'img/bigbytes-full-darkbg.png',
                href: 'https://bigbytes.com',
                width: 570,
            },
            links: [
                {
                    label: 'Community',
                    href: 'https://github.com/getbigbytes/bigbytes/discussions',
                },
                {
                    label: 'Blog',
                    href: 'https://www.bigbytes.com/blog',
                },
                {
                    label: 'Company',
                    href: 'https://www.bigbytes.com/about',
                },
                {
                    label: 'Careers',
                    href: 'https://www.notion.so/bigbytes/Bigbytes-Job-Board-a2c7d872794b45deb7b76ad68701d750',
                },
                {
                    label: 'Media kit',
                    href: 'https://www.notion.so/bigbytes/Bigbytes-Media-kit-f4424136bb5a4c8891c0d535dd5e5911',
                },
            ],
            copyright: `Copyright © ${new Date().getFullYear()} Bigbytes. Built with Docusaurus.`,
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
                        'https://github.com/getbigbytes/bigbytes/edit/main/docs/',
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
                    primaryColor: '#00a99d',
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
