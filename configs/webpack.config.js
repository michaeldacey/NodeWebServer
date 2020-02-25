module.exports = {
  mode: "development",    		// development, production or none
  devtool: "inline-source-map",
  entry: "./singlepageapp/ts/app.ts",
  output: {
    filename: "bundle.js", 
	path: __dirname+'/../clientside/dist'
  },
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: [".ts", ".tsx", ".js"]
  },
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension 
	  // will be handled by `ts-loader`
      { 
		test: /\.tsx?$/, 
		"use": {
			"loader": "ts-loader",
			"options": {
				"transpileOnly": true,
				"configFile": "tsconfig.app.json"
			}
		} 
	  },
	  // all handlebars templates
	  { 
		test: /\.hbs$/, 
		use: "handlebars-loader" 
	  }  
    ]
  }
};
