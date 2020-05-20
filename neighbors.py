import fasttext
import fasttext.util
import json
ft = fasttext.load_model("./data/cc.ja.300.bin")

while True:
    query = input()
    if query == "$kill":
        break

    neighbors = [{"score": r[0], "word": r[1]}
                 for r in ft.get_nearest_neighbors(query)]

    res = {"request": query, "result": neighbors}
    print(json.dumps(res))
