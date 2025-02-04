from bs4 import BeautifulSoup
import requests

def scrap(URL):
    response = requests.get(URL)
    if response.status_code == 200:
        soup = BeautifulSoup(response.content, 'html.parser')
        
        print(soup.find('div',id='redlist-js'))
        return soup
    else:
        return None
    
scrap('https://www.iucnredlist.org/species/12835/510082')