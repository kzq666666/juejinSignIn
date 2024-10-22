from flask import Flask, request, jsonify
from cal_gap import identify_gap

app = Flask(__name__)

@app.route('/', methods=['GET'])
def index():
    return "hello flask!"

@app.route('/api/get_slider_gap', methods=['GET'])
def hello():
    return "GET SLIDER GAP TEST"



@app.route('/api/get_slider_gap', methods=['POST'])
def get_slide_gap_router():
    try:
        bg_url = request.form.get('bg_url')
        slider_url = request.form.get('slider_url')
        # res = urllib.request.urlopen(bg_url)
        # image_data = res.read()
        print(bg_url, slider_url)
        res = identify_gap(str(bg_url), str(slider_url))
        return jsonify(res)
    except Exception as e:
        return jsonify({
            "x": 0,
            "width": 0,
            "height": 0,
        })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4396)