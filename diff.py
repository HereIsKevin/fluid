old = ["a", "b", "c", "d", "c", "e"]
new = ["e", "b", "d", "c", "a", "f", "g"]

# point = (0, 0)
# boundary = (0, 0)

def diff(old, new):
    points = []

    for x in range(0, max(len(old), len(new))):
        blah = False

        for y in range(0, x):
            if x < len(old) and y < len(new):
                if len(points) < 1 or points[-1][0] < x and points[-1][1] < y:
                    print(" ", x, y)

                    if old[x] == new[y]:
                        print(x, y)
                        points.append([x, y])
                        blah = True
                        break

            if y < len(old) and x < len(new):
                if len(points) < 1 or points[-1][0] < y and points[-1][1] < x:
                    print(" ", y, x)

                    if old[y] == new[x]:
                        print(y, x)
                        points.append([y, x])
                        blah = True
                        break

        if blah:
            continue

        if x < len(old) and x < len(new):
            if len(points) < 1 or points[-1][0] < x and points[-1][1] < x:
                print(" ", x, x)

                if old[x] == new[x]:
                    print(x, x)
                    points.append([x, x])
                    continue

diff(old, new)
