import fitz  # PyMuPDF
import os

def extract_images(pdf_path, output_dir):
   # Criar diretório de saída se não existir
   if not os.path.exists(output_dir):
      os.makedirs(output_dir)
   
   # Abrir o PDF
   pdf_document = fitz.open(pdf_path)
   
   # Iterar sobre cada página
   for page_number in range(len(pdf_document)):
      # Obter a página
      page = pdf_document[page_number]
      
      # Lista de imagens na página
      image_list = page.get_images()
      
      # Iterar sobre cada imagem na página
      for image_index, img in enumerate(image_list):
        # Extrair informações da imagem
        xref = img[0]
        base_image = pdf_document.extract_image(xref)
        image_bytes = base_image["image"]
        
        # Determinar a extensão do arquivo
        image_ext = base_image["ext"]
        
        # Criar nome do arquivo
        image_filename = f"page_{page_number + 1}_image_{image_index + 1}.{image_ext}"
        image_path = os.path.join(output_dir, image_filename)
        
        # Salvar a imagem
        with open(image_path, "wb") as image_file:
           image_file.write(image_bytes)
        
        print(f"Imagem extraída: {image_filename}")
   
   pdf_document.close()

if __name__ == "__main__":
   # Caminhos dos arquivos
   pdf_path = "v5_rulebook_pt-br_02bLogo.pdf"
   output_dir = "extracted_images"
   
   # Extrair imagens
   extract_images(pdf_path, output_dir) 