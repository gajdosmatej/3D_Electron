import tkinter
import math

class MyCanvas:
    canvas = None
    grid_step = 50
    width = None
    height = None
    vertices = None
    newest_dot = None

    def mouseMotion(self, event):
        spread = 12
        if self.newest_dot != None:
            self.canvas.delete(self.newest_dot)

        x, y = event.x, event.y
        for vertex in self.vertices:
            if vertex[0] > (x-spread) and vertex[0] < (x+spread):
                if vertex[1] > (y-spread) and vertex[1] < (y+spread):
                    self.newest_dot = self.addDot(vertex)
                    return


    def addDot(self, vertex):
        size = 8
        return self.canvas.create_oval(vertex[0]-size/2,vertex[1]-size/2,vertex[0]+size/2,vertex[1]+size/2, fill="blue")


    def __init__(self, top, width, height):
        self.canvas = tkinter.Canvas(top, bg="white", width=width, height=height)
        self.width = width
        self.height = height
        self.canvas.pack()
        self.canvas.bind('<Motion>', self.mouseMotion)

        self.vertices = self.initGrid()

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
                        actual_col - self.grid_step/3, font="Times 12 italic",text=str(self.width - actual_col))

        x_vals = [i*self.grid_step for i in range(0, row_num)]
        y_vals = [i*self.grid_step for i in range(0, col_num)]
        return {(x,y) for x in x_vals for y in y_vals}




top = tkinter.Tk()
top.title("Editor")

labelTitle = tkinter.Label(top, text="Editor", font="Times 20")
labelTitle.pack(side=tkinter.TOP)
#top.attributes('-zoomed', True)
buttonAdd = tkinter.Button(top, text="Add")
buttonAdd.pack(side=tkinter.RIGHT)

canvas = MyCanvas(top, 600, 400)

top.mainloop()
