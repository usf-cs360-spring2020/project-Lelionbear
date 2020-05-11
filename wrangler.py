from imdb import IMDb
import pandas as pd
import csv
import requests
import json
import pprint
# create an instance of the IMDb class
ia = IMDb()

# df = pd.read_csv('Film_Locations_in_San_Francisco.csv')
# saved_column = df['Title']
url_1 = "https://api.themoviedb.org/3/movie/"
url_2 = "?api_key=e3ef60f0734139ce8ab92d2438a45d87&language=en-US"
year_limit = 2000
# collection = {'San Francisco':[]}
titles = []
year = []
company = []
actors_1 = []
actors_2 = []
actors_3 = []
ratings = []


###  FILTER OUT BY YEAR
with open('Film_Locations_in_San_Francisco.csv', newline='') as f:
    reader = csv.reader(f)
    for row in reader:
        # print(row)
        try:
            if int(row[1]) >= year_limit and row[0] not in titles:
                titles.append(row[0])
                year.append(row[1])
                company.append(row[4])
        except:
            #do nothing
            print()


data = []
i = 0
unique =[]
genres_type = []
### READ JSON FILE TO FIND THE TITLES AND GET THE ID
for line in open('movie_ids_05_04_2020.json', 'r'):
    obj = json.loads(line)
    o = obj['original_title']
    # print(o)
    if o in titles: #and o not in unique:

        id = obj['id']
        r = requests.get(url_1+str(id)+url_2).text
        j = json.loads(r)

        try:
            DMDB_year = int(j['release_date'][:4])
        except:
            # print(j)
            continue

        index = titles.index(o)

        if DMDB_year >= year_limit and int(year[index]) == int(j['release_date'][:4]):
            if j['title'] in unique:
                continue;

            # for genre in j['genres']:
            #     name = genre['name']
            #     if name not in genres_type:
            #         genres_type.append(name)


            unique.append(j)
            # pprint.pprint(j)
            # print(j['title'], j['release_date'][:4], j['imdb_id'], j['revenue'])
            # pprint.pprint(j['imdb_id'])
            # pprint.pprint(j['title'])
            # pprint.pprint(j['revenue'])

            # i = i + 1
            # if i == 5:
            #     break
                # exit()
# collection = {"name" : "San Francisco", "children" : unique}
# final_json = json.dumps(collection)
# print(final_json)
# pprint.pprint(final_json)
# pprint.pprint(final_json) # vote average/voting count, revenue, popularity


####  SUNBURST CSV
print("city,genre,year,decade,id,title,release_date,net,budget,revenue,vote_average")
for item in unique:
    DMDB_year = int(item['release_date'][:4])
    three = DMDB_year // 10
    DMDB_modYear = int(str(three) + '0')
    DMDB_id = item['imdb_id']
    DMDB_title = item['title']
    DMDB_release_date = item['release_date']
    DMDB_budget = str(item['budget'])
    DMDB_revenue = str(item['revenue'])
    DMDB_net = str(item['revenue'] - item['budget'])
    DMDB_avgVote = str(item['vote_average'])

    for genre in item['genres']:
        DMDB_genre = genre['name']

        print("San Francisco," + DMDB_genre + "," + str(DMDB_year) + "," + str(DMDB_modYear) + "," + str(DMDB_id) + "," + DMDB_title + "," + DMDB_release_date + "," + DMDB_net + "," + DMDB_budget + "," + DMDB_revenue + "," + DMDB_avgVote)










# sunburst_json = {"key" : "San Francisco", "children" : []}
# gen_dictionary = {}
# gen_arr = []
# yr_dic = {}
# {key:sf,  gen_dic -> yr_dic ->
# children:[{
#     key: genre,
#     child: [{
#         key:year,
#         id: movieID}]}]}
# print(unique)
# for item in unique:
#     DMDB_year = int(item['release_date'][:4])
#     # DMDB_genre = []
#     DMDB_id = item['imdb_id']
#
#     for genre in item['genres']:
#         DMDB_genre = genre['name']
#
#         movie = {"key" : DMDB_id, "size" : 1}
#
#         if DMDB_genre in gen_dictionary:
#             yr_arr = gen_dictionary[DMDB_genre]
#
#             for yr in yr_arr:
#                 if DMDB_year == yr_arr["key"]:
#                     movies_arr = yr["child"]
#                     movies_arr.append(movie)
#                     break
#
#             # if DMDB_year in gen_dictionary[DMDB_genre]:
#             #     gen_dictionary[DMDB_genre][DMDB_year].append(movie)
#             # else:
#             #     gen_dictionary[DMDB_genre][DMDB_year] = [movie]
#         else:
#             # yr_dic = {(DMDB_year) : [movie]}
#             # gen_dictionary[DMDB_genre] = yr_dic
#             # yr_dic = {"key" : (DMDB_year), "child" : [movie]}
#             yr_dic = {}
#             yr_dic["key"] = DMDB_year
#             yr_dic["child"] = [movie]
#             gen_dictionary[DMDB_genre] = [yr_dic]
#             # gen_arr.append({"key" : DMDB_genre, "child" : yr_dic})


        # print("San Francisco," + DMDB_genre + "," + str(DMDB_year) + "," + str(DMDB_id))
        # DMDB_genre.append(name)
# gen_dictionary["keys"] = "genre"
# gen_dictionary["child"] = gen_arr
# pprint.pprint(gen_dictionary)
# for genre in genres_type:
#     for item in unique:
#         for g in item['genres']:
#             name = g['name']
#
#             if name



# DMDB_year = int(j['release_date'][:4])
# DMDB_genre = []
# DMDB_id = j['imdb_id']
#
# for genre in j['genres']:
#     name = genre['name']
#     DMDB_genre.append(name)












### UTILIZE THE TMDB API FOR MOVIES/SHOWS
# with open('output.txt') as f:
#     reader = csv.reader(f)
#     for row in reader:
#         titles.append(row[0])
# f.close()

# headers = ["city", "release_date", "vote_average", "movie", "revenue", "popularity"]
# c = "San Francisco"
# d = ""
# v = ""
# m = ""
# r = ""
# p = ""
# output = ""
# for movie in unique:
#     d = movie['release_date']
#     v = movie['vote_average']
#     m = movie['title']
#     r = movie['revenue']
#     p = movie['popularity']
#     output = c + str(v) + m + str(r) + str(p)
#     print(output)
#     exit()




















# for original_title in open('original_movie_titles.txt','r'):
#     # ot = original_title.split(' ')
#     # print(original_title)
#     ot = original_title.split('\n')[0]
#     if ot in titles:
#         print(ot)
        # data.append(obj)

# print(data[0])
# with open('movie_ids_05_04_2020.json', 'r') as myfile:
#     data = myfile.read()
# obj = json.loads(data)
# print(obj)
# f = open('movie_ids_05_04_2020.json', newline='')
# data = json.load(f)
# for i in data:
#     print(i)
# with open('movie_ids_05_04_2020.json') as f:
#     reader = csv.reader(f)
#     for row in reader:
#         print(row)






# collection = {'San Francisco': [{7.0: [{'David Walton': ['About a Boy']}]}, {7.2: [{'Blake Lively': ['Age of Adaline']}]}, {7.3: [{'Michael Douglas': ['Ant-Man']}]}]}

# print(collection)
# headers = ["city", "rating", "actor", "movie"]
# c = ""
# r = ""
# a = ""
# m = ""
# output = ""
# with open('csvfile.csv','wb') as file:
#     # writer = csv.writer(file, delimiter=',')
#
#     header = 'city, rating, actor, movie\n'
#     content = str.encode(header)
#     file.write(content)
#     for sf in collection:
#         for ratings in collection.get(sf):
#             # print(sf) ## header
#             c = sf
#             for rating in ratings:
#                 r = rating
#                 # print(rating) ## header
#                 # print(ratings.get(rating))
#                 for actors in ratings.get(rating):
#                     # print(actors) # map
#                     for actor in actors:
#                         a = actor
#                         for movie in actors.get(actor):
#                             # print(movie)
#                             m = movie
#                             o = c + ", " + str(r) + ", " + a + ", " + m + "\n"
#                             content = str.encode(o)
#                             file.write(content)
# file.close()
                    # print(c,r,a,m,'\n')

                    # print(actor)
                    # print(actors.get(actor)) # movie
                # print(actor.get(actor))
            # for score in rating.get():
        # for actor in collection.get(sf).get(rating):
        #     print(sf,rating,actor)
# header = "city, rating, actor, movie\n"
# print(header + output)
# print(titles)
# print(data)
# print(d)
# print(ratings)
# print(actors_1)
# print(actors_2)
# print(actors_3)
# id = d[2].movieID
# m = ia.get_movie(id)
# p = m['rating']
# print(m.infoset2keys)
# print(p)
# sf, actors, movies, ratings
# sf, ratings, actors, movies








# print(ia.get_movie_infoset())
#
# # get a movie
# movie = ia.get_movie('0133093')
#
# # print the names of the directors of the movie
# print('Directors:')
# for director in movie['directors']:
#     print(director['name'])
#
# # print the genres of the movie
# print('Genres:')
# for genre in movie['genres']:
#     print(genre)
#
# # search for a person name
# people = ia.search_person('Mel Gibson')
# for person in people:
#    print(person.personID, person['name'])
