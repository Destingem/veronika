import requests
from bs4 import BeautifulSoup
import json

def scrap_quotes():
    base_url = "https://citaty.net/vyhledavani/"
    query_params = {"h": "Veronika", "page": 2}  # začínáme od stránky 2
    all_quotes = []
    page = 1

    while True:
        print(f"Scrapujeme stránku {page}...")
        query_params["page"] = page
        response = requests.get(base_url, params=query_params)
        
        # Pokud stránka neexistuje nebo došlo k chybě
        if response.status_code != 200:
            print("Konec stránek nebo chyba při načítání.")
            break

        soup = BeautifulSoup(response.text, "html.parser")
        blockquotes = soup.find_all("div", class_="blockquote")
        
        # Pokud na stránce nejsou žádné citáty, ukončíme cyklus
        if page == 9:
            print("Nebyly nalezeny žádné citáty, ukončuji scraping.")
            break

        for bq in blockquotes:
            # Získání textu citátu
            text_tag = bq.find("p", class_="blockquote-text")
            quote_text = text_tag.get_text(strip=True) if text_tag else ""

            # Získání autora a zdroje (např. kniha)
            origin_tag = bq.find("p", class_="blockquote-origin")
            if origin_tag:
                origin_links = origin_tag.find_all("a", class_="link")
                author = origin_links[0].get_text(strip=True) if len(origin_links) >= 1 else ""
                book = origin_links[1].get_text(strip=True) if len(origin_links) >= 2 else ""
            else:
                author = ""
                book = ""

            quote_data = {
                "text": quote_text,
                "author": author,
                "book": book
            }
            all_quotes.append(quote_data)
        
        page += 1

    # Uložení do JSON souboru
    with open("quotes.json", "w", encoding="utf-8") as f:
        json.dump(all_quotes, f, ensure_ascii=False, indent=4)
    print(f"Uloženo {len(all_quotes)} citátů do souboru 'quotes.json'.")

if __name__ == "__main__":
    scrap_quotes()