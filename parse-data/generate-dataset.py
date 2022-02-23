import pandas as pd
import requests
import bs4

# UNFCC
# EU
# NATO
# OECD
# G7
# UN
# OSCE
# BIS
# COE
# ILO
# INTERPOL
url = 'https://en.wikipedia.org/wiki/List_of_parties_to_the_United_Nations_Framework_Convention_on_Climate_Change'
page = requests.get(url)
soup = bs4.BeautifulSoup(page.content, 'html.parser')
print(soup.prettify())
#table = soup.find('table', {'class': 'wikitable sortable'})
tables = soup.find_all('table')
table = tables[0]
result = pd.DataFrame([[td.text for td in row.find_all('td')] for row in table.tbody.find_all('tr')])
print(result)

# /html/body/div[3]/div[3]/div[5]/div[1]/table[1]