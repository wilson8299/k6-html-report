# k6-html-report

k6-html-report 是一個能為 k6 壓測工具產生 HTML 報告的擴充程式，測試完成時透過 handleSummary callback 調用打包完成的 bundle.js 生成報告。

> 壓測腳本是使用 JavaScript，但實際上 k6 是用 Golang 編寫，所以對 k6 進行擴充要用 Golang 編寫後透過 xk6 進行編譯。
>
> 而生成報告的過程中使用到 ejs ，所以需要用 webpack 進行打包，提供給測試文件匯入。

<p align="center" width="100%">
    <img src="https://imgur.com/tuanG6T.gif" alt="example" width="85%"/>
</p>



## Table of contents

- [Built With](#built-with)
- [Usage](#usage)
- [Structure](#structure)
- [Extension](#extension)
- [Report](#report)



## Built With

- [k6](https://k6.io/)
- [xk6](https://github.com/grafana/xk6)
- [jq](https://stedolan.github.io/jq/)
- [ejs](https://ejs.co/)
- [webpack](https://webpack.js.org/)
- [chart.js](https://www.chartjs.org/)



## Usage

1. 下載 tool 文件夾內的 k6-ex 和 jq。

2. 在測試腳本中匯入 bundle.js。

   ```javascript
   import { htmlReport } from "https://raw.githubusercontent.com/wilson8299/k6-html-report/main/build/bundle.js";
   ```

3. 使用 handleSummary 調用 htmlReport。

   ```javascript
   // test.js
   export function handleSummary(data) {
       return {
           'report.html': htmlReport(data, {
               jq: "jq.exe",                # jq 執行檔路徑
               args: ["[ inputs | select(.type==\"Point\" and (.metric==\"vus\" or .metric==\"http_reqs\" or .metric==\"http_req_duration\"))]",	  # jq 過濾器
                      "points.json"]}),     # k6 產生的 JSON 文件路徑
       }
   }
   ```

 4. 執行。

    ```cmd
    $ k6-ex.exe run --out json=.\points.json .\test.js
    ```



詳細的使用方法可以參考 example，執行exec.bat。



## Structure

```
File Tree
├── build/
│ └── bundle.js           # 打包後的文件
├── example/              # 範例
├── extension/
│ └── command.go          # k6 擴展文件
├── src/						
│ ├── k6-html-report.js   # 產生報告的主程式碼
│ └── template.ejs        # 樣板
├── tool/			
│ ├── jq-win64.exe        # jq 執行檔 
│ └── k6-ex.exe           # command.go 經由 xk6 編譯後的 k6 執行檔
├── package.json				
├── package-lock.json					
└── webpack.config.js
```



## Extension

 k6 沒有提供執行 command 的方法，所以編寫 command.go 後用 xk6 編譯，編譯完成會產生 k6 執行檔，裡面就會包含 command 方法。

```cmd
$ xk6 build --with xk6-command=.
```

```go
// extension/command.go
func init() {
	modules.Register("k6/x/command", new(Command))
}

type Command struct{}
func (*Command) Exec(name string, args []string) string {
	cmd := exec.Command(name, args...)
	out, _ := cmd.CombinedOutput()
	return string(out)
}
```



## Report

使用 ejs 樣板引擎產生 HTML。

```javascript
const html = ejs.render(template, {
	DATE,
	checkPasses,
	checkFailures,
	thresholdFailures,
	chartData,
	data,
	metrics
})
```



折線圖使用 chart.js 繪製，折線圖需要的數據都在 k6 run --out 產生的 JSON 文件，為了讀取文件並透過 jq 進行過濾，要匯入編譯好的 k6/x/command，並使用 command.exec 執行 command。 

```javascript
import command from 'k6/x/command'

...

let jsonData = JSON.parse(command.exec(opts.jq, opts.args))

jsonData.forEach(element => {
    ...
})
```



完成後透過 webpack 進行打包供測試腳本產生報告。



<p align="center" width="100%">
    <img src="https://imgur.com/7gM3sAe.png" alt="html-report" width="85%"/>
</p>
