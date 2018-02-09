#!/usr/bin/env python
# Name: Tijs Teulings   
# Student number: 10782982
"""
This script scrapes IMDB and outputs a CSV file with highest rated tv series.
"""

import csv
import re
from requests import get
from requests.exceptions import RequestException
from contextlib import closing
from bs4 import BeautifulSoup

# for BeautifulSoup documentation see: https://www.crummy.com/software/BeautifulSoup/bs4/doc/
# for re documentation see: https://docs.python.org/2/library/re.html


TARGET_URL = "http://www.imdb.com/search/title?num_votes=5000,&sort=user_rating,desc&start=1&title_type=tv_series"
BACKUP_HTML = 'tvseries.html'
OUTPUT_CSV = 'tvseries.csv'


def extract_tvseries(dom):
    """
    Extracts the following information of IMDB's highest rated TV series:
    - TV Title
    - Rating
    - Genres (comma separated if more than one)
    - Actors/actresses (comma separated if more than one)
    - Runtime (only a number!)
    """

    # create list to collect info of the series
    serie_list = []

    # select html code with information of the series
    series = dom.find_all(class_ = 'lister-item-content')
    
    # cycle through series to extract info
    for serie in series:
        # extract title of serie
        title = serie.find(class_ = 'lister-item-header').a.string

        # extract rating of series
        rating = serie.find(class_ = 'inline-block ratings-imdb-rating')["data-value"]

        # extract genre of serie
        genre = serie.find(class_ = 'genre').string.strip()

        # extract starring actors of serie
        actors_page = serie.find_all(href = re.compile("/name/"))

        # collect all actors as a string and comma seperated
        actors = []

        for actor in actors_page:
            actors.append(actor.string)
        
        all_actors = ", ".join(actors)

        # look for runtime
        runtime = serie.find(class_ = 'runtime').string.strip(' min')

        # collect individual serie information to overall list
        serie_list.append((title, rating, genre, all_actors, runtime))

    return serie_list


def save_csv(outfile, tvseries):
    """
    Outputs a CSV file containing highest rated TV-series.
    """
    writer = csv.writer(outfile)
    
    # write headers to csv
    writer.writerow(['Title', 'Rating', 'Genre', 'Actors', 'Runtime'])

    # write info of every serie to a new row of csv
    for series in tvseries:
        writer.writerow(series)


def simple_get(url):
    """
    Attempts to get the content at `url` by making an HTTP GET request.
    If the content-type of response is some kind of HTML/XML, return the
    text content, otherwise return None
    """
    try:
        with closing(get(url, stream=True)) as resp:
            if is_good_response(resp):
                return resp.content
            else:
                return None
    except RequestException as e:
        print('The following error occurred during HTTP GET request to {0} : {1}'.format(url, str(e)))
        return None


def is_good_response(resp):
    """
    Returns true if the response seems to be HTML, false otherwise
    """
    content_type = resp.headers['Content-Type'].lower()
    return (resp.status_code == 200
            and content_type is not None
            and content_type.find('html') > -1)


if __name__ == "__main__":

    # get HTML content at target URL
    html = simple_get(TARGET_URL)

    # save a copy to disk in the current directory, this serves as an backup
    # of the original HTML, will be used in grading.
    with open(BACKUP_HTML, 'wb') as f:
        f.write(html)

    # parse the HTML file into a DOM representation
    dom = BeautifulSoup(html, 'html.parser')

    # extract the tv series (using the function you implemented)
    tvseries = extract_tvseries(dom)

    # write the CSV file to disk (including a header)
    with open(OUTPUT_CSV, 'w', newline='') as output_file:
        save_csv(output_file, tvseries)