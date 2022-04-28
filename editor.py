import tkinter
import tkinter.filedialog
import math
import numpy
import json
import os

class Character:
    x = None
    y = None
    size = None
    colour = None
    tk_handler = None
    canvas = None
    path = None

    def __init__(self, x, y, size, my_canvas, colour):
        self.x = x
        self.y = y
        self.size = size
        self.canvas = my_canvas
        self.path = [[self.x, self.y]]
        self.draw(colour)

    def setPath(self, x,y):
        self.path.append([x,y])

    def draw(self, colour):
        self.tk_handler = self.canvas.addRectangle(self.x, self.y, self.size, colour)

    def __del__(self):
        self.canvas.canvas.delete(self.tk_handler)

    def toExport(self, myCanvas):
        return {"x": self.x - myCanvas.cameraX, "y": self.y - myCanvas.cameraY, "size": self.size, "character": True, "path": self.path}


class Brick:
    x = None
    y = None
    size = None
    colour = None
    tk_handler = None
    canvas = None
    textureStr = None

    def __init__(self, x, y, size, my_canvas, colour, textureStr):
        self.x = x
        self.y = y
        self.textureStr = textureStr
        self.size = size
        self.canvas = my_canvas
        self.draw(colour)

    def draw(self, colour):
        self.tk_handler = self.canvas.addRectangle(self.x, self.y, self.size, colour)

    def __del__(self):
        self.canvas.canvas.delete(self.tk_handler)

    def toExport(self, myCanvas):
        return {"x": self.x - myCanvas.cameraX, "y": self.y - myCanvas.cameraY, "size": self.size, "texture": "textures/" + self.textureStr + ".jpg", "character": False}


class MyCanvas:
    canvas = None
    grid_step = 50
    width = None
    height = None
    vertices = None
    matrix = None
    mouse_brick = None
    row_num = None
    col_num = None
    activeCharacter = None

    #funkcni pro mrizku, kde jsou hlavni uzly
    '''def mouseMotion(self, event):
        spread = 12
        if self.newest_dot != None:
            self.canvas.delete(self.newest_dot)

        x, y = event.x, event.y
        for vertex in self.vertices:
            if vertex[0] > (x-spread) and vertex[0] < (x+spread):
                if vertex[1] > (y-spread) and vertex[1] < (y+spread):
                    self.newest_dot = self.addDot(vertex)
                    return'''
    def getVertexFromMouse(self, event):
        x, y = event.x, event.y
        for vertex in self.vertices:
            if vertex[0] <= x and (vertex[0] + self.grid_step) > x:
                if vertex[1] <= y and (vertex[1] + self.grid_step) > y:
                    return vertex


    def mouseMotion(self, event):
        if self.mouse_brick != None:
            del self.mouse_brick

        vertex = self.getVertexFromMouse(event)
        if self.activeCharacter == None:
            self.mouse_brick = Brick(vertex[0], vertex[1], self.grid_step, self, "#AAAAAA", "NULL")
        else:
            coord = self.activeCharacter.path[-1:][0]
            x0, y0 = coord[0], coord[1]
            if( numpy.abs(event.x - x0) > numpy.abs(event.y - y0)):
                self.mouse_brick = Brick(vertex[0], y0, self.grid_step, self, "#9999FF", "NULL")
            else:
                self.mouse_brick = Brick(x0, vertex[1], self.grid_step, self, "#9999FF", "NULL")


    def addRectangle(self, x, y, size, colour):
        return self.canvas.create_rectangle(x, y, x+size, y+size, fill=colour)

    def addDot(self, vertex):
        size = 8
        return self.canvas.create_oval(vertex[0]-size/2,vertex[1]-size/2,vertex[0]+size/2,vertex[1]+size/2, fill="blue")


    def __init__(self, top, width, height):
        self.canvas = tkinter.Canvas(top, bg="white", width=width, height=height)
        self.width = width
        self.height = height
        self.canvas.pack()
        self.canvas.bind('<Motion>', self.mouseMotion)
        self.canvas.bind("<Button-1>", self.mouseClick)

        self.col_num = math.floor(self.width / self.grid_step)
        self.row_num = math.floor(self.height / self.grid_step)

        self.vertices = self.initGrid()
        self.matrix = numpy.empty((self.col_num, self.row_num), dtype=Brick)


    #model, kde jsou hlavni uzly
    '''def initGrid(self):
        col_num = math.floor(self.width / self.grid_step)
        row_num = math.floor(self.height / self.grid_step)

        for row in range(0, row_num):
            actual_row = row*self.grid_step
            self.canvas.create_line(actual_row, 0, actual_row, self.width)
            self.canvas.create_text(actual_row - self.grid_step/3,
                        self.height - self.grid_step/3, font="Times 12 italic",text=str(actual_row))

        for col in range(0, col_num):
            actual_col = col*self.grid_step
            self.canvas.create_line(0, actual_col, col_num*self.grid_step, actual_col)
            self.canvas.create_text(self.grid_step/3,
                        actual_col - self.grid_step/3, font="Times 12 italic",text=str(self.height - actual_col))

        x_vals = [i*self.grid_step for i in range(0, row_num)]
        y_vals = [i*self.grid_step for i in range(0, col_num)]
        return {(x,y) for x in x_vals for y in y_vals}
'''

    def initGrid(self):
        row_num = math.floor(self.width / self.grid_step)
        col_num = math.floor(self.height / self.grid_step)

        for row in range(0, row_num):
            actual_row = row*self.grid_step
            self.canvas.create_line(actual_row, 0, actual_row, self.width)
            self.canvas.create_text(actual_row - self.grid_step/3,
                        self.height - self.grid_step/3, font="Times 12 italic",text=str(actual_row))

        for col in range(0, col_num):
            actual_col = col*self.grid_step
            self.canvas.create_line(0, actual_col, row_num*self.grid_step, actual_col)
            self.canvas.create_text(self.grid_step/3,
                        actual_col - self.grid_step/3, font="Times 12 italic",text=str(self.height - actual_col))

        x_vals = [i*self.grid_step for i in range(0, row_num)]
        y_vals = [i*self.grid_step for i in range(0, col_num)]
        return {(x,y) for x in x_vals for y in y_vals}

    isCameraPlaced = False
    cameraX, cameraY = 0, 0

    def placeCamera(self, x, y):
        self.isCameraPlaced = True
        self.cameraX, self.cameraY = x, y
        self.canvas.create_oval(x+self.grid_step/2-10, y+self.grid_step/2-10, x+self.grid_step/2+10, y+self.grid_step/2+10)


    def mouseClick(self, event):
        vertex = self.getVertexFromMouse(event)
        row = vertex[1] // self.grid_step
        column = vertex[0] // self.grid_step

        if radioVar.get() == 1:
            if self.matrix[column, row] == None:    #muze v budoucnu delat problem - pri presunu kamery se starym cihlam nezmeni souradnice
                self.matrix[column, row] = Brick(vertex[0], vertex[1], self.grid_step, self, "#00AA00", textureStr.get())

        elif radioVar.get() == 2:
            if self.matrix[column, row] != None:
                obj = self.matrix[column, row]
                self.matrix[column, row] = None
                del obj
        elif radioVar.get() == 3:
            if (self.matrix[column, row] == None) and (not self.isCameraPlaced):
                self.placeCamera(vertex[0], vertex[1])
        elif radioVar.get() == 4:
            if self.matrix[column, row] == None:
                self.matrix[column, row] = Character(vertex[0], vertex[1], self.grid_step, self, "#AA0000")

        elif radioVar.get() == 0:

            if self.activeCharacter != None and self.matrix[column, row] == None:
                self.activeCharacter.path.append([self.mouse_brick.x, self.mouse_brick.y])
                self.matrix[column, row] = self.mouse_brick
                self.matrix[column, row].textureStr = "NULL"

            elif type( self.matrix[column, row] ).__name__ == "Character":
                if self.matrix[column, row] == self.activeCharacter:
                    self.activeCharacter = None
                else:
                    self.activeCharacter = self.matrix[column, row]


top = tkinter.Tk()
top.title("Editor")


def export():
    matrix = canvas.matrix
    n1, n2 = matrix.shape
    obj_list = []

    for i in range(0, n1):
        for j in range(0, n2):
            if matrix[i][j] != None:
                if type(matrix[i][j]).__name__ == "Character" or matrix[i][j].textureStr != "NULL":
                    obj_list.append(matrix[i][j].toExport(canvas))

    f = open("export.json", "w")
    f.write(json.dumps(obj_list))
    f.close()


def getTextureNames():
    return map(lambda str: str[0:-4], os.listdir("textures"))

labelTitle = tkinter.Label(top, text="Editor", font="Times 20")
labelTitle.pack(side=tkinter.TOP)
#top.attributes('-zoomed', True)
buttonAdd = tkinter.Button(top, text="Export", command=export)
buttonAdd.pack(side=tkinter.RIGHT)

radioVar = tkinter.IntVar()
radioCursor = tkinter.Radiobutton(top, text="Cursor", variable=radioVar, value=0)
radioCursor.pack()
radioPaint = tkinter.Radiobutton(top, text="Paint", variable=radioVar, value=1)
radioPaint.pack()
radioDelete = tkinter.Radiobutton(top, text="Delete", variable=radioVar, value=2)
radioDelete.pack()
radioCamera = tkinter.Radiobutton(top, text="Camera", variable=radioVar, value=3)
radioCamera.pack()
radioCharacter = tkinter.Radiobutton(top, text="Character", variable=radioVar, value=4)
radioCharacter.pack()
radioVar.set(0)

textureNames = getTextureNames()
textureStr = tkinter.StringVar()
textureStr.set("Wood")
optionMenu = tkinter.OptionMenu(top, textureStr, *textureNames)
optionMenu.pack()

canvas = MyCanvas(top, 600, 400)

top.mainloop()
