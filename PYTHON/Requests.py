# -*- coding: utf-8 -*-
import requests
import time
from bs4 import BeautifulSoup


class Requests:

    def __init__(self, url):
        self.url = url
        #         self.params = {
        #             'query': query,
        #             'where': 'nexearch',
        #         }
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'}
        self.response = ''
        self.html = ''
        self.soup = ''

    def resquest_To_(self):
        while self.response == '':
            try:
                self.response = requests.get(self.url, headers=self.headers)
                print('response')
                break
            except requests.exceptions.ConnectionError:
                print("Connection refused")
                print("reloading...")
                time.sleep(5)

        html = self.response.text

        # ��ƼǮ������ ���ڰ� ����
        self.soup = BeautifulSoup(html, 'html.parser')

    def resquest_to_(self, url):
        responseStatus = ''
        while responseStatus == '':
            try:
                self.response = requests.get(url, headers=self.headers)
                print('response', self.response)
                responseStatus = 200
                break
            except requests.exceptions.ConnectionError:
                print("Connection refused")
                print("reloading...")
                time.sleep(5)

        html = self.response.text

        # ��ƼǮ������ ���ڰ� ����
        self.soup = BeautifulSoup(html, 'html.parser')

    def getSoup(self):
        return self.soup




