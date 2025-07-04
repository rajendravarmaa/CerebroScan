import io
import base64
import matplotlib
matplotlib.use('Agg')  # 👈 disables Tkinter GUI backend (uses Agg for non-GUI)
import matplotlib.pyplot as plt


def generate_confidence_chart(scores_dict, title="Prediction Confidence"):
    labels = list(scores_dict.keys())
    values = list(scores_dict.values())

    sorted_pairs = sorted(zip(values, labels), reverse=True)
    sorted_values, sorted_labels = zip(*sorted_pairs)

    plt.figure(figsize=(6, 2.5))
    bars = plt.barh(sorted_labels, sorted_values, color="steelblue")
    plt.xlabel("Confidence (%)")
    plt.xlim(0, 100)
    plt.title(title)
    plt.gca().invert_yaxis()

    for bar in bars:
        width = bar.get_width()
        plt.text(width + 1, bar.get_y() + bar.get_height() / 2,
                 f"{width:.2f}%", va='center')

    plt.tight_layout()

    buffer = io.BytesIO()
    plt.savefig(buffer, format="PNG")
    plt.close()
    buffer.seek(0)
    encoded = base64.b64encode(buffer.read()).decode("utf-8")
    return encoded
