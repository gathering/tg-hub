import promiseConfig from "eslint-config-promise";

export default [
	...(Array.isArray(promiseConfig) ? promiseConfig : [promiseConfig]),
	{
		rules: {
			"no-console": "off",
		},
	},
];
