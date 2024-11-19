from django.shortcuts import render, HttpResponse
from .models import MyPrint
from .forms import MyPrintForm
from reportlab.lib.pagesizes import letter, landscape
from reportlab.pdfgen import canvas
import os
import win32print
import win32api
import time

def home(request):
    if request.method == 'POST':
        form = MyPrintForm(request.POST, request.FILES)
        if form.is_valid():
            my_print = form.save()

            # Retrieve user input for printing settings
            copies = int(request.POST.get("copies", 1))  # Default to 1 copy if not specified
            orientation = request.POST.get("orientation", "portrait")  # Retrieve orientation
            printer_name = "Brother DCP-1600 series"  # Update with your actual printer name

            # Call the print function with the uploaded file path and specified options
            file_path = my_print.printfile.path
            print_pdf(file_path, printer_name, copies, orientation)
            
            return HttpResponse("File sent to printer successfully.")
    else:
        form = MyPrintForm()

    return render(request, 'home.html', {'form': form})
import os
import time
import win32print
import win32api
from reportlab.lib.pagesizes import letter, landscape
from reportlab.pdfgen import canvas

def generate_pdf_with_reportlab(temp_pdf_path, orientation="portrait"):
    """Generates a PDF file with some sample text."""
    
    # Ensure correct page size based on orientation
    if orientation.lower() == "landscape":
        page_size = landscape(letter)  # Landscape page size
    else:
        page_size = letter  # Default to portrait if not specified

    # Create a new PDF with ReportLab
    c = canvas.Canvas(temp_pdf_path, pagesize=page_size)
    # Add some sample text (adjusted based on orientation)
    if orientation.lower() == "landscape":
        c.drawString(100, 500, "This is a test page in landscape orientation.")
        c.drawString(100, 460, "Printing via ReportLab and win32print.")
    else:
        c.drawString(100, 750, "This is a test page in portrait orientation.")
        c.drawString(100, 700, "Printing via ReportLab and win32print.")
    
    c.showPage()  # Add a new page if needed
    c.save()  # Save and close the PDF

    # Adding a short delay to ensure OS has released the file
    time.sleep(1)
    return temp_pdf_path

def print_pdf(file_path, printer_name, copies=1, orientation="portrait"):
    # Generate the PDF if not already provided
    temp_pdf_path = file_path if file_path else generate_pdf_with_reportlab("temp_output.pdf", orientation)

    # Ensure the file exists before proceeding
    if not os.path.exists(temp_pdf_path):
        print("Error: The temporary PDF file was not created.")
        return

    try:
        # Open printer and start a print job
        hPrinter = win32print.OpenPrinter(printer_name)
        try:
            # Attempt to send PDF to printer using ShellExecute (default viewer)
            for _ in range(copies):
                # Use ShellExecute for printing the PDF (relies on default PDF viewer)
                win32api.ShellExecute(0, "print", temp_pdf_path, None, ".", 0)
                time.sleep(1)  # Wait a bit between copies (you can adjust this if needed)
        except Exception as e:
            print("Error during printing:", e)
        finally:
            win32print.ClosePrinter(hPrinter)

        print("Print job sent successfully.")

    except Exception as e:
        print("Error during printing:", e)
        print("Attempting fallback method...")

        # Fallback to ShellExecute if direct printing fails
        for _ in range(copies):
            try:
                win32api.ShellExecute(0, "print", temp_pdf_path, None, ".", 0)
                time.sleep(1)  # Delay between copies
            except Exception as fallback_error:
                print("Error during fallback printing:", fallback_error)

    finally:
        # Retry deletion of the temporary file with delays
        for attempt in range(5):
            try:
                if os.path.exists(temp_pdf_path):
                    os.remove(temp_pdf_path)
                    print("Temporary file deleted successfully.")
                break
            except Exception as cleanup_error:
                print(f"Attempt {attempt+1} to delete temporary file failed: {cleanup_error}")
                time.sleep(1)  # Wait before retrying deletion
