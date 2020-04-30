from imdb import IMDb
import pandas as pd
import csv
# create an instance of the IMDb class
ia = IMDb()

# df = pd.read_csv('Film_Locations_in_San_Francisco.csv')
# saved_column = df['Title']

collection = {'San Francisco':[]}
data = []
titles = []
d = []
actors_1 = []
actors_2 = []
actors_3 = []
ratings = []
# for title in saved_column:
#     if title not in titles:
#         print(title)
#         titles.append(title)


# movies = ia.search_movie("Ant-Man")
# print(movies)

with open('Film_Locations_in_San_Francisco.csv', newline='') as f:
    reader = csv.reader(f)
    for row in reader:
        # print(row)
        try:
            if int(row[1]) >= 2000 and row[0] not in titles:
                # print(row)
                movies = ia.search_movie(row[0])
                if len(movies) > 0:
                    if movies[0]['title'] not in titles:
                        id = movies[0].movieID
                        rating = ia.get_movie(id)['rating']


                        # if row[0] != movies[0]['title']:
                        #     titles.append(row[0])
                        #     t = row[0]
                        # else:
                        titles.append(movies[0]['title'])
                        t = movies[0]['title']

                        data.append(row)
                        d.append(movies[0])
                        ratings.append(rating)
                        actors_1.append(row[8])
                        actors_2.append(row[9])
                        actors_3.append(row[10])

                        # if collection.get('San Francisco').append(di)
                        ii = [t]
                        di = {row[8] : ii}
                        i = {rating : []}
                        i.get(rating).append(di)
                        collection.get('San Francisco').append(i)
        except:
            #do nothing
            print('an except happened')
# collection = {'San Francisco': [{7.0: [{'David Walton': ['About a Boy']}]}, {7.2: [{'Blake Lively': ['Age of Adaline']}]}, {7.3: [{'Michael Douglas': ['Ant-Man']}]}]}

print(collection)
headers = ["city", "rating", "actor", "movie"]
c = ""
r = ""
a = ""
m = ""
output = ""
with open('csvfile.csv','wb') as file:
    # writer = csv.writer(file, delimiter=',')

    header = 'city, rating, actor, movie\n'
    content = str.encode(header)
    file.write(content)
    for sf in collection:
        for ratings in collection.get(sf):
            # print(sf) ## header
            c = sf
            for rating in ratings:
                r = rating
                # print(rating) ## header
                # print(ratings.get(rating))
                for actors in ratings.get(rating):
                    # print(actors) # map
                    for actor in actors:
                        a = actor
                        for movie in actors.get(actor):
                            # print(movie)
                            m = movie
                            o = c + ", " + str(r) + ", " + a + ", " + m + "\n"
                            content = str.encode(o)
                            file.write(content)
file.close()
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
