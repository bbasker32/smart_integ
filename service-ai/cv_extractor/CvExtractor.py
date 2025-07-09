from cv_extractor.handlers.pdf_handler import handle_pdf
from cv_extractor.handlers.docx_handler import handle_docx
from cv_extractor.handlers.txt_handler import handle_txt
from cv_extractor.handlers.odt_handler import handle_odt
from cv_extractor.handlers.pptx_handler import handle_pptx

from cv_extractor.handlers.pdf_handler_direct import handle_pdf_direct
from cv_extractor.handlers.docx_handler_direct import handle_docx_direct
from cv_extractor.handlers.txt_handler_direct import handle_txt_direct
from cv_extractor.handlers.odt_handler_direct import handle_odt_direct
from cv_extractor.handlers.pptx_handler_direct import handle_pptx_direct

from cv_extractor.utils.file_utils import get_file_type, setup_logging, log_info

setup_logging()

def process_file(file_path, skip_sensitive_information):
    ext = get_file_type(file_path)
    log_info(f"Dispatching handler for: {file_path}, Skip Sensitive: {skip_sensitive_information}")

    if not skip_sensitive_information:
        if ext == ".pdf":
            return handle_pdf(file_path)
        elif ext == ".docx":
            return handle_docx(file_path)
        elif ext == ".txt":
            return handle_txt(file_path)
        elif ext == ".odt":
            return handle_odt(file_path)
        elif ext == ".pptx":
            return handle_pptx(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_path}")
    else:
        if ext == ".pdf":
            return handle_pdf_direct(file_path)
        elif ext == ".docx":
            return handle_docx_direct(file_path)
        elif ext == ".txt":
            return handle_txt_direct(file_path)
        elif ext == ".odt":
            return handle_odt_direct(file_path)
        elif ext == ".pptx":
            return handle_pptx_direct(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_path}")
