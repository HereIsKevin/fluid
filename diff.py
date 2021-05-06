# TODO: make sure moving actually works properly...

def diff(old_values, new_values):
    old_values = list(old_values)

    old_index = 0
    new_index = 0

    while old_index <= len(old_values) and new_index <= len(new_values):
        if old_index < len(old_values):
            old_value = old_values[old_index]
        else:
            old_value = None

        if new_index < len(new_values):
            new_value = new_values[new_index]
        else:
            new_value = None

        print(f"Old value is {old_value}")
        print(f"New value is {new_value}")
        print(f"Point is [{old_index}, {new_index}]")

        if old_value == new_value:
            old_index += 1
            new_index += 1

            print(f"    Advance to [{old_index}, {new_index}]")
        # elif old_value in new_values:
        #     index = new_values.index(old_value)
        #     value = old_values.pop(old_index)

        #     old_values.insert(index, value)

        #     print(f"    Search for position from {old_index}")
        #     print(f"    Move {old_index} ({old_value}) to {index}")
        elif len(old_values) < len(new_values):
            old_values.insert(old_index, new_values[new_index])

            print(f"    Insert value at {new_index} ({new_value}) to {old_index}")
        else:
            del old_values[old_index]

            print(f"    Remove value at {old_index} ({old_value})")

        print(f"Current is {old_values}")
        print()

    return old_values


if __name__ == "__main__":
    old_values = ["a", "b", "c", "d", "e", "f", "g"]
    new_values = ["a", "c", "b", "e", "d", "h", "g"]

    # old_values = ["a", "b", "c", "d", "e", "f", "g"]
    # new_values = ["a", "f", "c", "d", "e", "b", "g"]

    print(f"Old is {old_values}")
    print(f"New is {new_values}")
    print()
    print(f"Modified is {diff(old_values, new_values)}")
