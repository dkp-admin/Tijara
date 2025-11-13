export const CardPrintPreview = `
  <html>
	<head>
		<title>Billing Receipt -Cash Payment, No Customer added</title>
		<style>
			*{
		
		margin: 0;
		padding: 0;
		box-sizing: border-box;
		}
		body {
		font-family: Arial, sans-serif;
		margin: 0;
		padding: 0;
		}
		
		.container {
		width: 400px;
		margin: 20px auto;
		text-align: center;
		border: 1px solid #000;
		padding: 30px 5px;
		font-weight: bold;
		font-size: 15px;
		line-height: 20px;
		}
		
		.logo {
		margin-bottom: 10px;
		}
		.t-left{
			text-align: left;
		}
		.t-right{
			text-align: right;
			vertical-align: baseline;
		}
		.t-center{
				text-align: center;
		}
		.fs-22{
				font-size: 22px;
		}
		
		h4 {
		margin: 0;
		font-size: 16px;
		font-weight: bold;
		}
		
		p {
		margin: 0;
		font-size: 13px;
		}
		.no-bold{
		font-weight: normal;
		}
		.w-100{
		width: 100%;
		}
		
		.divider {
		border-top: 1px dashed #000;
		margin: 10px 0;
		}
		
		table {
		width: 100%;
		border-collapse: collapse;
		margin: 6px 0;
		}
		
		th, td {
		padding: 6px;
		}
		
		
		.total-section {
		margin-top: 10px;
		}
		
		.qr-code {
		margin-top: 20px;
		}
		
		.bar-code {
		margin-top: 20px;
		}
		
		.footer {
		margin: 10px auto;
		font-size: 12px;
		}
		</style>
	</head>
	<body>
		<div class="container">
			<div class="logo">
				<img src="http://respinor.com/wp-content/uploads/2017/04/logo-dummy.png" alt="Logo" width="80%">
			</div>
			<div class="divider"></div>
			<h4>Brand/Location NAME (ENGLISH)</h4>
			<h4>Brand/Location NAME (ARABIC)</h4>
			<p>VAT NO/لرقم الضریبة .</p>
			<p>3005678400003</p>
			<p>Ph. No.: 0509080706</p>
			<p>*Store Address**</p>
			<div class="divider"></div>
			<table>
				
				<tr>
					<td class="t-left">Invoice No.</td>
					<td>BAC/2023/001</td>
					<td class="t-right">إجماليفاتو</td>
				</tr>
				<tr>
					<td class="t-left">Time & Date </td>
					<td>12:15:10 2023-04-25</td>
					<td class="t-right">تاریخ والوقت</td>
				</tr>
				
				
			</table>
			
			<div class="divider"></div>
			<h4>Simplified Tax Invoice</h4>
			<h4>اتورة ضریبیة المبسطة</h4>
			<div class="divider"></div>
			<table>
				<tr>
					<td class="t-left">Description <br> مجموع
					</td>
					<td>Unit Price <br>  سعمیة</td>
					<td>Qty <br>  سلوحده كمیة</td>
					<td class="t-right">Total (Incl. VAT) <br> شامل ضریب</td>
				</tr>
				
				
				<tr>
					<td colspan="2" class="t-left no-bold">Lipton Ice Tea Peach Flavorr <br> لیبتون شاي مثلج بنكھة الخوخ</td>
				</tr>
				<tr>
					<td></td>
					<td>100000	</td>
					<td>1</td>
					<td class="t-right">1000000.00</td>
				</tr>
				<tr>
					<td></td>
					<td class="no-bold"><del>1.74</del></td>
					<td class="no-bold">1</td>
					<td class="t-right no-bold">2.00</td>
				</tr>
				<tr>
					<td colspan="2" class="t-left no-bold">Lipton Ice Tea Orange Flavor <br> لیبتون شاي مثلج بنكھة الخو</td>
				</tr>
				<tr>
					<td></td>
					<td>1.74</td>
					<td>1</td>
					<td class="t-right">2.00</td>
				</tr>
			</table>
			<div class="divider"></div>
			<table>
				<tr>
					<td colspan="3" class="t-left">Total Taxable Amount <br> (Excluding VAT) <br>
						اإجمالي الخاضع للضریبة   <br>(غیر شامل ضریبة)
					</td>
					<td class="t-right">18.27 SAR</td>
				</tr>
				<tr>
					<td colspan="3" class="t-left">Total VAT <br> مجموع ضریبة القیمة المضافة</td>
					<td class="t-right">2.73 SAR</td>
				</tr>
				<tr>
					<td colspan="3" class="t-left">Total Savings/Discounts <br> إجمالي المدخرات / الخصومات</td>
					<td class="t-right">-2.00 SAR</td>
				</tr>
				
			</table>
			<div class="divider"></div>
			<table>
				<tr>
					<td colspan="3" class="t-left">Total Amount <br> إجمالي المبلغ المستح</td>
					<td class="t-right fs-22">21.00 SAR</td>
				</tr>
				
			</table>
			<div class="divider"></div>
			<table>
				<tr>
					<td colspan="3" class="t-left">Card</td>
					<td class="t-right">21.00 SAR</td>
				</tr>
				
			</table>
			<div class="divider"></div>
			<table>
				<tr>
					<td colspan="3" class="t-left">Cash</td>
					<td class="t-right">21.00 SAR</td>
				</tr>
				
			</table>
			<div class="divider"></div>
			<table>
				
				<tr>
					<td colspan="3" class="t-left">Tendered Cash</td>
					<td class="t-right">30.00 SAR</td>
				</tr>
				<tr>
					<td colspan="3" class="t-left">Change</td>
					<td class="t-right">9.00 SAR</td>
				</tr>
			</table>
			<div class="divider"></div>
			<div class="qr-code">
				<img src="https://www.pngall.com/wp-content/uploads/2/QR-Code-PNG-Picture.png" height="120px" alt="can't load QR">
			</div>
			<div class="divider"></div>
			<div class="footer">
				<p>Thank You for Shopping with Us  <br>كرا للتسوق معنا</p>
			</div>
			<div class="divider"></div>
			<div class="bar-code">
				<img src="https://webstockreview.net/images/barcode-clipart-long-3.png" width="200px">
			</div>
			
		</div>
	</body>
</html>`;
