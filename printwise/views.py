import os
import subprocess
from django.shortcuts import render, HttpResponse
from .forms import MyPrintForm
from PyPDF2 import PdfReader, PdfWriter
from django.conf import settings
import win32api

# Directory to save generated PDFs
GENERATED_PDFS_DIR = os.path.join(settings.MEDIA_ROOT, 'generated_pdfs')
os.makedirs(GENERATED_PDFS_DIR, exist_ok=True)
import mimetypes
from PIL import Image

def convert_image_to_pdf(image_file):
    """Converts an image to a PDF without modifying its orientation."""
    pdf_path = os.path.join(GENERATED_PDFS_DIR, "image_converted.pdf")
    with Image.open(image_file) as img:
        img.convert("RGB").save(pdf_path)
    return pdf_path

def home(request):
    if request.method == 'POST':
        form = MyPrintForm(request.POST, request.FILES)
        if form.is_valid():
            file = form.cleaned_data['file']
            file_type, _ = mimetypes.guess_type(file.name)

            # If the uploaded file is an image, convert it to a PDF
            if file_type and file_type.startswith('image'):
                file = convert_image_to_pdf(file)

            # Get user input for orientation and number of copies
            orientation = request.POST.get('orientation', 'portrait')
            copies = int(request.POST.get('copies', 1))

            print("ORIENTATION REQUESTED:", orientation)
            print("NUMBER OF COPIES REQUESTED:", copies)

            # Generate a PDF with the specified orientation
            generated_pdf_path = generate_pdf_with_orientation(file, orientation)

            # Define the printer name (update as per your printer)
            printer_name = "EPSON M2170 Series (Copy 1)"

            # Print the generated PDF
            print_pdf(generated_pdf_path, printer_name, copies)

            return HttpResponse("The file was printed successfully.")
    else:
        form = MyPrintForm()

    return render(request, 'home.html', {'form': form})

def generate_pdf_with_orientation(uploaded_file, orientation):
    """Generates a PDF with the selected orientation (portrait or landscape)."""
    output_filename = f"generated_{orientation}.pdf"
    output_path = os.path.join(GENERATED_PDFS_DIR, output_filename)

    # Ensure the directory exists
    os.makedirs(GENERATED_PDFS_DIR, exist_ok=True)

    # Remove the file if it already exists
    if os.path.exists(output_path):
        os.remove(output_path)

    
    reader = PdfReader(uploaded_file)
    writer = PdfWriter()

    # Adjust each page for the desired orientation
    for page in reader.pages:
        if orientation == 'landscape':
            page.rotate(90)  # Rotate page to landscape
        writer.add_page(page)

    # Save the new PDF
    
    with open(output_path, 'wb') as output_pdf:
        writer.write(output_pdf)

    return output_path

import win32print
 
import win32api
import os
import time
import win32api
from PyPDF2 import PdfReader, PdfWriter

 
def create_multi_copy_pdf(original_pdf_path, copies):
    """Creates a temporary PDF containing the specified number of copies of the entire document."""
    reader = PdfReader(original_pdf_path)
    writer = PdfWriter()

    # Add the entire document the correct number of times
    for _ in range(copies):
        for page in reader.pages:
            writer.add_page(page)

    # Generate a path for the multi-copy PDF
    temp_pdf_path = os.path.splitext(original_pdf_path)[0] + f"_multi_copy_{copies}.pdf"
    
    # Write the temporary multi-copy PDF to disk
    with open(temp_pdf_path, 'wb') as temp_pdf:
        writer.write(temp_pdf)
    
    return temp_pdf_path


def is_file_in_use(file_path):
    """Checks if the file is in use by another process."""
    try:
        with open(file_path, 'r+b'):
            return False  # File is not in use
    except IOError:
        return True  # File is in use


def print_pdf(file_path, printer_name, copies, delay_seconds=2):
    """Prints a multi-copy PDF file."""
    try:
        print("Creating multi-copy PDF...")
        multi_copy_pdf_path = create_multi_copy_pdf(file_path, copies)

        # Wait for the file to become available
        while is_file_in_use(multi_copy_pdf_path):
            print(f"Waiting for file {multi_copy_pdf_path} to be available...")
            time.sleep(1)

        print(f"Sending {multi_copy_pdf_path} to printer: {printer_name}")

        # Send the file to the printer
        win32api.ShellExecute(
            0,
            "print",
            multi_copy_pdf_path,
            f"/d:{printer_name}",
            ".",
            0
        )
        
        print(f"Print job for {copies} copies sent successfully.")

        # Wait for a short delay to ensure the print job starts
        time.sleep(delay_seconds)

    except Exception as e:
        print(f"An error occurred while printing: {e}")
    finally:
        # Clean up the temporary multi-copy PDF
        if os.path.exists(multi_copy_pdf_path):
            os.remove(multi_copy_pdf_path)
            print(f"Temporary multi-copy PDF removed: {multi_copy_pdf_path}")
