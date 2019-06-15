# -*- coding: utf-8 -*- 
from bs4 import BeautifulSoup
import json
import Requests as rs


if __name__ =="__main__":

    movie = rs.Requests("https://movie.naver.com/movie/running/current.nhn")

    movie.resquest_To_()
    currentMovieData = movie.getSoup()
    
    movieBox = currentMovieData.select('.lst_dsc')
    for movieDesc in movieBox:
        print(movieDesc.select('.tit > a'))
        print(movieDesc.select('.tit > span'))
        print(movieDesc.select('.star_t1 .num'))
        for movieInfo in movieDesc.select('.info_txt1'):
            print(movieInfo.select('a'))
          
        #print(movieDesc.select('.tit'))
    #print('currentMovieData ' , currentMovieData.select('.lst_dsc'))


    
