import fitz  # PyMuPDF
import re
import os

def clean_text(text):
   # Remove caracteres especiais e formatação indesejada
   text = re.sub(r'\s+', ' ', text)  # Remove espaços múltiplos
   text = text.strip()  # Remove espaços no início e fim
   return text

def extract_text_to_markdown(pdf_path, output_file):
   # Abrir o PDF
   pdf_document = fitz.open(pdf_path)
   
   # Abrir arquivo de saída
   with open(output_file, 'w', encoding='utf-8') as md_file:
      # Escrever cabeçalho com emojis e formatação atraente
      md_file.write("# 📖 Manual de Regras VTES v5\n\n")
      md_file.write("> *Vampire: The Eternal Struggle - Quinta Edição*\n\n")
      md_file.write("![Logo VTES](extracted_images/page_1_image_1.png)\n\n")
      
      # Adicionar tabela de conteúdo
      md_file.write("## 📑 Índice\n\n")
      
      # Seções principais predefinidas
      sections = [
        "🎮 Introdução",
        "🎯 Objetivo do Jogo",
        "🧩 Componentes",
        "🃏 Tipos de Cartas",
        "🏁 Começando o Jogo",
        "⏱️ Sequência de Turno",
        "⚔️ Combate",
        "🏛️ Política",
        "🧛‍♂️ Seitas Vampíricas",
        "📚 Regras Avançadas",
        "❓ Dúvidas Frequentes",
        "🔍 Glossário"
      ]
      
      for section in sections:
        md_file.write(f"- [{section}](#{section.split(' ')[1].lower()})\n")
      
      md_file.write("\n---\n\n")
      
      # Variáveis para controle de seções
      current_section = ""
      in_table = False
      content_buffer = []
      
      # Iterar sobre cada página
      for page_number in range(len(pdf_document)):
        # Obter a página
        page = pdf_document[page_number]
        
        # Extrair texto da página
        text = page.get_text()
        
        # Processar o texto por linhas
        lines = text.split('\n')
        
        for line in lines:
           line = line.strip()
           if not line:
              continue
           
           # Detectar títulos de seção
           if line.isupper() and len(line) < 30:
              # Provável título de seção principal
              section_emoji = "📌"
              for s in sections:
                if line.lower() in s.lower():
                   section_emoji = s.split(' ')[0]
                   break
              
              current_section = line
              md_file.write(f"\n## {section_emoji} {line}\n\n")
              continue
           
           # Detectar subtítulos
           if len(line) < 50 and not line.endswith('.') and not re.search(r'\d+\s*$', line):
              if ":" in line:
                # Provável subtítulo com definição
                parts = line.split(":", 1)
                md_file.write(f"### {parts[0].strip()} 🔹\n\n")
                if parts[1].strip():
                   md_file.write(f"{parts[1].strip()}\n\n")
              else:
                # Subtítulo normal
                md_file.write(f"### {line} 🔹\n\n")
              continue
           
           # Detectar início de tabela
           if "........" in line or "------" in line:
              if not in_table:
                in_table = True
                md_file.write("\n| Item | Descrição |\n|------|----------|\n")
              continue
           
           # Detectar fim de tabela
           if in_table and len(line) < 10:
              in_table = False
              continue
           
           # Processar linha de tabela
           if in_table:
              parts = re.split(r'\s{3,}', line, 1)
              if len(parts) == 2:
                md_file.write(f"| {parts[0].strip()} | {parts[1].strip()} |\n")
              continue
           
           # Detectar listas
           if line.startswith('◼') or line.startswith('•'):
              md_file.write(f"- {line[1:].strip()}\n")
              continue
           
           # Detectar regras importantes
           if "REGRAS AVANÇADAS" in line:
              md_file.write(f"\n> ⚠️ **{line}**\n\n")
              continue
           
           # Texto normal - verificar se é continuação de parágrafo
           if content_buffer and not line[0].isupper() and not content_buffer[-1].endswith('.'):
              content_buffer[-1] += " " + line
           else:
              content_buffer.append(line)
           
           # Escrever parágrafos acumulados se tivermos muitos
           if len(content_buffer) > 3:
              for paragraph in content_buffer:
                md_file.write(f"{paragraph}\n\n")
              content_buffer = []
        
        # Escrever parágrafos restantes no buffer
        for paragraph in content_buffer:
           md_file.write(f"{paragraph}\n\n")
        content_buffer = []
        
        # Adicionar separador de página apenas se não for a última página
        if page_number < len(pdf_document) - 1:
           md_file.write("\n---\n\n")
   
   pdf_document.close()
   
   print(f"Texto extraído e formatado com sucesso em {output_file}")

if __name__ == "__main__":
   # Caminhos dos arquivos
   pdf_path = "v5_rulebook_pt-br_02bLogo.pdf"
   output_file = "manual_vtes_formatado.md"
   
   # Garantir que a pasta extracted_images existe
   if not os.path.exists("extracted_images"):
      print("Pasta de imagens não encontrada. As referências de imagem podem não funcionar.")
   
   # Extrair texto
   extract_text_to_markdown(pdf_path, output_file)
   print(f"Texto extraído e salvo em {output_file}") 