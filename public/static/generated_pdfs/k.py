import win32print
printer_name = "EPSON Universal Print Driver"  # Replace with your printer name

printer_handle = win32print.OpenPrinter(printer_name)
printer_info = win32print.GetPrinter(printer_handle, 2)
print(printer_info)  # Debug the printer's current settings
win32print.ClosePrinter(printer_handle)
