module.exports = {
    extends: ['stylelint-config-recommended'],
    rules: {
        'at-rule-no-unknown': null,
        'no-descending-specificity': null,
        'selector-pseudo-class-no-unknown': [
            true,
            {
                ignorePseudoClasses: ['global', 'local'],
            },
        ],
        'selector-class-pattern': [
            '^([a-z][a-z0-9]*(-[a-z0-9]+)*|[a-z][a-z0-9-]*(__[a-z0-9-]+)*(--[a-z0-9-]+)*)$',
            {
                message: 'Expected class selector to be kebab-case or BEM notation',
            },
        ],
    },
};
