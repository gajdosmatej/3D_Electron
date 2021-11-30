'''
import sys
from PyQt5.QtCore import *
from PyQt5.QtGui import *
from PyQt5.QtWidgets import *

def window():
   app = QApplication(sys.argv)
   win = QWidget()
   win.showMaximized()

   mainLabel = QLabel()
   mainLabel.setText("Editor")
   mainLabel.setAlignment(Qt.AlignCenter)
   mainLabel.setFont(QFont('Arial', 28))

   vbox = QVBoxLayout()
   vbox.addWidget(mainLabel)
   vbox.addStretch()

   canvas = QPainter()
   canvas.drawLine(1,1,400,400)
   vbox.addWidget(canvas)

   win.setLayout(vbox)
   win.setWindowTitle("Editor")
   win.show()
   sys.exit(app.exec_())


if __name__ == '__main__':
   window()


class MyMainScreen(QMainWindow):
    def __init__(self, parent=None):
        QMainWindow.__init__(self, parent)
        mainLabel = QLabel()
        mainLabel.setText("Editor")
        mainLabel.setAlignment(Qt.AlignCenter)
        mainLabel.setFont(QFont('Arial', 28))

    def paintEvent(self, event):
        painter = QPainter(self)
        painter.setPen(QPen(Qt.black))
        painter.drawLine(0,0,500,500)

if __name__ == "__main__":
    app = QApplication(sys.argv)
    mainscreen = MyMainScreen()
    mainscreen.showMaximized()
    app.exec_()
'''


import tkinter

side_len = None
f = None
canvas_len = 650

offset_vector = (20,20)
'''
def initFile():
    states_dump_file_name = "./states.txt"
    global f
    f = open(states_dump_file_name, "r")
    line = f.readline()
    break_index = line.index("[")
    return json.loads(line[break_index:])


def readState(buttonStep, step_T = 1):
    for i in range(1, step_T):  f.readline()
    line = f.readline()
    if line == "":
        buttonStep["state"] = "disabled"
        return []
    else:
        break_index = line.index("[")
        time = line[:break_index]
        json_state = line[break_index:]
        return (time, json.loads(json_state) )

def closeFile():
    global f
    f.close()
    f = None


def paintCubeLeft(row, column, canvas, color, lattice_side_length):


    w = side_len * math.sqrt(3) / 2

    x1 = column * w + (offset_vector[0] + w)
    y1 = side_len * (row + column / 2) + (lattice_side_length * side_len / 2 + offset_vector[1] - side_len/2)
    x2 = x1 + w
    y2 = y1 + side_len / 2
    x3 = x1
    y3 = y1 + side_len
    x4 = x2
    y4 = y2 + side_len

    #print([x1, y1, x2, y2, x3, y3, x4, y4])
    #canvas.create_rectangle(x_begin, y_begin, x_end, y_end, fill=color)
    canvas.create_polygon((x1, y1), (x2, y2), (x4, y4), (x3, y3), fill=color)

def paintCubeRight(row, column, canvas, color, lattice_side_length):

    column = lattice_side_length - column   #aby vhodne pasovalo
    w = side_len * math.sqrt(3) / 2

    x1 = column * w + (offset_vector[0] + w * lattice_side_length)
    y1 = side_len * (row - column / 2)  + (lattice_side_length * side_len + offset_vector[1])
    x2 = x1 + w
    y2 = y1 - side_len / 2
    x3 = x1
    y3 = y1 + side_len
    x4 = x2
    y4 = y2 + side_len

    #print([x1, y1, x2, y2, x3, y3, x4, y4])
    #canvas.create_rectangle(x_begin, y_begin, x_end, y_end, fill=color)
    canvas.create_polygon((x1, y1), (x2, y2), (x4, y4), (x3, y3), fill=color)

def paintCubeTop(row, column, canvas, color, lattice_side_length):

    w = math.sqrt(3) / 2 * side_len

    x1 = (lattice_side_length + column - row) * w + offset_vector[0]
    y1 = (column + row) * side_len / 2 + offset_vector[1]
    x2 = x1 + w
    y2 = y1 - side_len / 2
    x3 = x1 + 2*w
    y3 = y1
    x4 = x2
    y4 = y1 + side_len / 2

    #print([x1, y1, x2, y2, x3, y3, x4, y4])
    #canvas.create_rectangle(x_begin, y_begin, x_end, y_end, fill=color)
    canvas.create_polygon((x1, y1), (x2, y2), (x3, y3), (x4, y4), fill=color)


def collapseHigherDimensions(state, axis):
    if axis == 0:   return state[0]
    elif axis == 1: return state[:,len(state)-1]
    elif axis == 2: return state[:,:,len(state)-1]  #aby steny odpovidaly
    else:   print("Undefined behaviour")


def chooseColor(val):
    if val == 0: return "red"
    elif val == 1: return "#FFAA00"
    elif val == 2: return "#0000FF"
    elif val == 3: return "#996600"
    elif val == 4: return "#000099"
    elif val == -1: return "orange"
    elif val == 5: return "cyan"
    elif val == 6: return "gray"
    else: return "black"


#nyni jen 3d
def paintState(state, canvas):
    lattice_side_length = len(state)    #tohle neni uplne bezpecne - spoleham na to, ze vsechny rozmery jsou stejne

    sub_state = collapseHigherDimensions(state,0)

    for row in range(0, lattice_side_length):
        for column in range(0, lattice_side_length):
            color = chooseColor(sub_state[row][column])
            paintCubeTop(row, column, canvas, color, lattice_side_length)

    sub_state = collapseHigherDimensions(state,1)

    for row in range(0, lattice_side_length):
        for column in range(0, lattice_side_length):
            color = chooseColor(sub_state[row][column])
            paintCubeLeft(row, column, canvas, color, lattice_side_length)

    sub_state = collapseHigherDimensions(state,2)
    for row in range(0, lattice_side_length):
        for column in range(0, lattice_side_length):
            color = chooseColor(sub_state[row][column])
            paintCubeRight(row, column, canvas, color, lattice_side_length) #aby steny odpovidaly
    initLanes(len(state))


def textWidgetOverwrite(widget, text):
    widget.delete(0.0, tkinter.END)
    widget.insert(tkinter.END, text)


def step(canvas, button):
    step_T = int(textStep.get(1.0, tkinter.END))
    state_info = readState(button, step_T)
    state = numpy.array(state_info[1])
    textWidgetOverwrite(textTime, "t = " + state_info[0])


    if state.size != 0:
        canvas.delete("all")
        paintState(state, canvas)


def flow(tkApp, canvas, button):
    #button["state"] = "disabled"
    state_info = readState(button)
    state = numpy.array(state_info[1])
    textWidgetOverwrite(textTime, "t = " + state_info[0])

    if state.size != 0:
        canvas.delete("all")
        paintState(state, canvas)
        tkApp.after(10, lambda: flow(tkApp,canvas,button))


def reset():
    closeFile()
    initFile()
    textWidgetOverwrite(textTime, "t = 0")
    initCanvas()
    buttonStep["state"] = "normal"
    buttonFlow["state"] = "normal"

def initLanes(state_len):
    whole_side_len = state_len*side_len
    w = math.sqrt(3) / 2 * side_len

    x = w*state_len + offset_vector[0] + w
    y1 = offset_vector[1] + whole_side_len - side_len
    y2 = y1 + whole_side_len
    canvas.create_line(x, y1, x, y2, width=1)

    y2 = y1
    x1 = offset_vector[0] + w
    y1 = offset_vector[1] + whole_side_len / 2 - side_len / 2
    x2 = x1 + w*state_len
    canvas.create_line(x1, y1, x2, y2, width=1)


    x1 = offset_vector[0] + w + 2*w*state_len
    y1 = offset_vector[1] + whole_side_len / 2 - side_len / 2
    canvas.create_line(x1, y1, x2, y2, width=1)


def initCanvas():
    state_info = readState(buttonStep)
    state = numpy.array(state_info[1])
    textWidgetOverwrite(textTime, "t = " + state_info[0])
    paintState(state, canvas)


lattice_L = len(initFile())
side_len = canvas_len // (2*lattice_L)

top = tkinter.Tk()
#top.attributes('-zoomed', True)

canvas = tkinter.Canvas(top, bg="white", height=canvas_len, width=canvas_len)

buttonStep = tkinter.Button(top, text="Step", command= lambda: step(canvas, buttonStep))
buttonStep.pack()

buttonFlow = tkinter.Button(top, text="Flow", command= lambda: flow(top, canvas, buttonFlow))
buttonFlow.pack()

buttonReset = tkinter.Button(top, text="Reset", command= lambda: reset())
buttonReset.pack()

textTime = tkinter.Text(top, height = 1, width = 25)
textTime.bind("<Key>", lambda e: "break")   #read-only
textTime.pack()

textStep = tkinter.Text(top, height = 1, width = 25)
textStep.insert(tkinter.END, "1")
textStep.pack()

initCanvas()

canvas.pack()

top.mainloop()

'''


top = tkinter.Tk()
#top.attributes('-zoomed', True)

canvas = tkinter.Canvas(top, bg="white", height=canvas_len, width=canvas_len)


buttonReset = tkinter.Button(top, text="Reset")
buttonReset.pack()

canvas.pack()

top.mainloop()
