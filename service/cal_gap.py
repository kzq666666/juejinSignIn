import urllib.request
import numpy as np
import cv2


def read_image_from_url(url):
    response = urllib.request.urlopen(url)
    image_data = np.asarray(bytearray(response.read()), dtype=np.uint8)
    image = cv2.imdecode(image_data, cv2.IMREAD_COLOR)
    return image


def identify_gap(bg, tp,):
    '''
    bg: 背景图片
    tp: 缺口图片
    '''
    # 读取背景图片和缺口图片
    bg_img = read_image_from_url(bg)  # 背景图片
    tp_img = read_image_from_url(tp)  # 缺口图片

    # 识别图片边缘
    bg_edge = cv2.Canny(bg_img, 100, 200)
    tp_edge = cv2.Canny(tp_img, 100, 200)

    # 转换图片格式
    bg_pic = cv2.cvtColor(bg_edge, cv2.COLOR_GRAY2RGB)
    tp_pic = cv2.cvtColor(tp_edge, cv2.COLOR_GRAY2RGB)

    # 缺口匹配
    res = cv2.matchTemplate(bg_pic, tp_pic, cv2.TM_CCOEFF_NORMED)
    min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(res)  # 寻找最优匹配

    # 绘制方框
    th, tw = tp_pic.shape[:2]
    tl = max_loc  # 左上角点的坐标
    br = (tl[0]+tw, tl[1]+th)  # 右下角点的坐标
    cv2.rectangle(bg_img, tl, br, (0, 0, 255), 2)  # 绘制矩形

    # 返回缺口的X坐标
    return {
        "x": tl[0],
        "width": bg_img.shape[1],
        "height": bg_img.shape[0],
    }


