# -*- coding: utf-8 -*-
from bs4 import BeautifulSoup
import json
import Requests as rs


def getImagePath():
    pass

if __name__ == "__main__":
    movieInfo= rs.Requests('')
    movie = rs.Requests("https://movie.naver.com/movie/sdb/rank/rmovie.nhn?sel=pnt&date=20190711&page=1")
    movie.resquest_To_()
    MovieInfoSoup = movie.getSoup()
    link = MovieInfoSoup.select("td.title div.tit5 a");
    #print( link )
    for j in range(len(link)):
        try:
            if 'href' in link[j].attrs: # attr 이있으면
                stringUrl = "https://movie.naver.com" + link[j].attrs['href']
                idx = stringUrl.find("?code=")
                #print(type(idx))
                movieCode = ( stringUrl[idx + 6: (len(stringUrl))])
                movieInfo.resquest_to_("https://movie.naver.com/movie/bi/mi/photoViewPopup.nhn?movieCode=" + movieCode); #img path
                movieInfoImgSoup = movieInfo.getSoup()
                img = movieInfoImgSoup.select('#targetImage')
                print("image SRC ", img[0]['src'])

                #print(stringUrl)
                movieInfo.resquest_to_(stringUrl); #info를 얻기위해
                movieInfoDetailSoup = movieInfo.getSoup()
                #print("movieInfoDetailSoup", movieInfoDetailSoup)
                title = movieInfoDetailSoup.select("h3.h_movie a")
                print(title)

                #
                #
                # infoSpec = movieInfoDetailSoup.select("p.info_spec span")
                # genre = infoSpec[0].text.strip()
                # regdate = infoSpec[3].text.strip()
                #
                # test =infoSpec[4].text
                # #print(test)
                # #print(infoSpec)
                #
                # director = movieInfoDetailSoup.select("div.info_spec2 dl.step1 dd a")[0];
                # actor = movieInfoDetailSoup.select("div.info_spec2 dl.step2 dd")[0].text;
                #
                # # content > div.article > div.mv_info_area > div.mv_info > dl > dd:nth-child(6) > p
                # a = movieInfoDetailSoup("div.info_spec2 dl")

                #print(a)
                # print(director)
                # print(actor)

                #나중엔 네이버  api 연동도 괜찮을듯 싶음
        finally:
            pass

