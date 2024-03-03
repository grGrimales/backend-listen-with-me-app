export interface Story {
    title: string;
    img: string;
    date: string;
    categories: string[];
    isFavorite: boolean;
    user: string;
    paragraph: Paragraph[];


}

class Paragraph {
    id_paragraph: string;
    text: string;
    translation: string;
    img: string;
    audio: string;

}



export const storyDummy: Story[] = [
    {
        "title": "Exploring CSS Units: My Journey with Web Design",
        "user" : "65aac2dd55c0112ee97df145",
        "img": "",
        "date": "2024-01-14",
        "categories": ["todas", "carlos"],
        "isFavorite": false,
        "paragraph": [
            {
                "id_paragraph": "0",
                "text": "In my journey as a web designer, I've learned that CSS, or Cascading Style Sheets, is crucial for styling web pages. One essential aspect I've come to understand is the different types of measurement units in CSS. These units are vital for defining the size of elements, spacing, and more.",
                "translation": "En mi trayectoria como diseñador web, he aprendido que el CSS, o Hojas de Estilo en Cascada, es crucial para el estilo de las páginas web. Un aspecto esencial que he llegado a entender son los diferentes tipos de unidades de medida en CSS. Estas unidades son vitales para definir el tamaño de los elementos, el espaciado y más.",
                "img": "",
                "audio": "https://res.cloudinary.com/dcxto1nnl/video/upload/v1704284143/academy-app/frases/2024/enero/2024-01-02/3/4_w49vxz.mp3"
            },
            {
                "id_paragraph": "1",
                "text": "There are two main categories of CSS units: absolute and relative. Absolute units, like pixels (px), are constant. A pixel is the smallest unit on a digital screen, and it's great for precise designs. However, it doesn't adapt well to different screen sizes.",
                "translation": "Hay dos categorías principales de unidades en CSS: absolutas y relativas. Las unidades absolutas, como los píxeles (px), son constantes. Un píxel es la unidad más pequeña en una pantalla digital y es excelente para diseños precisos. Sin embargo, no se adapta bien a diferentes tamaños de pantalla.",
                "img": "",
                "audio": "https://res.cloudinary.com/dcxto1nnl/video/upload/v1704284144/academy-app/frases/2024/enero/2024-01-02/3/5_rxw4e7.mp3"
            },
            {
                "id_paragraph": "2",
                "text": "Then, there are relative units, which are more flexible. They adjust according to other elements or settings. For example, percentages (%) adjust sizes relative to a parent element. This is handy for responsive design, as elements resize based on the parent container.",
                "translation": "Luego, están las unidades relativas, que son más flexibles. Se ajustan según otros elementos o configuraciones. Por ejemplo, los porcentajes (%) ajustan los tamaños en relación con un elemento padre. Esto es útil para el diseño adaptable, ya que los elementos cambian de tamaño según el contenedor padre.",
                "img": "",
                "audio": "https://res.cloudinary.com/dcxto1nnl/video/upload/v1704284143/academy-app/frases/2024/enero/2024-01-02/3/4_w49vxz.mp3"
            },
            {
                "id_paragraph": "3",
                "text": "Another relative unit is 'em'. It scales based on the font size of the element. If I set a font size to 16px and define a margin as 2em, the margin will be 32px. This unit is useful for maintaining consistent proportions.",
                "translation": "Otra unidad relativa es 'em'. Escala según el tamaño de la fuente del elemento. Si establezco un tamaño de fuente de 16px y defino un margen de 2em, el margen será de 32px. Esta unidad es útil para mantener proporciones consistentes.",
                "img": "",
                "audio": "https://res.cloudinary.com/dcxto1nnl/video/upload/v1704284144/academy-app/frases/2024/enero/2024-01-02/3/5_rxw4e7.mp3"
            },
           
        ]
    },

    {
        "user" : "65aac2dd55c0112ee97df145",
        "title": "My Journey as a Web Developer: Strengths, Challenges, and Growth",
        "img": "",
        "date": "2024-01-16",
        "categories": ["todas", "grediana"],
        "isFavorite": false,
        "paragraph": [
            {
                "id_paragraph": "0",
                "text": "In my journey as a web designer, I've learned that CSS, or Cascading Style Sheets, is crucial for styling web pages. One essential aspect I've come to understand is the different types of measurement units in CSS. These units are vital for defining the size of elements, spacing, and more.",
                "translation": "En mi trayectoria como diseñador web, he aprendido que el CSS, o Hojas de Estilo en Cascada, es crucial para el estilo de las páginas web. Un aspecto esencial que he llegado a entender son los diferentes tipos de unidades de medida en CSS. Estas unidades son vitales para definir el tamaño de los elementos, el espaciado y más.",
                "img": "",
                "audio": "https://res.cloudinary.com/dcxto1nnl/video/upload/v1704284143/academy-app/frases/2024/enero/2024-01-02/3/4_w49vxz.mp3"
            },
            {
                "id_paragraph": "1",
                "text": "There are two main categories of CSS units: absolute and relative. Absolute units, like pixels (px), are constant. A pixel is the smallest unit on a digital screen, and it's great for precise designs. However, it doesn't adapt well to different screen sizes.",
                "translation": "Hay dos categorías principales de unidades en CSS: absolutas y relativas. Las unidades absolutas, como los píxeles (px), son constantes. Un píxel es la unidad más pequeña en una pantalla digital y es excelente para diseños precisos. Sin embargo, no se adapta bien a diferentes tamaños de pantalla.",
                "img": "",
                "audio": "https://res.cloudinary.com/dcxto1nnl/video/upload/v1704284144/academy-app/frases/2024/enero/2024-01-02/3/5_rxw4e7.mp3"
            },
            {
                "id_paragraph": "2",
                "text": "Then, there are relative units, which are more flexible. They adjust according to other elements or settings. For example, percentages (%) adjust sizes relative to a parent element. This is handy for responsive design, as elements resize based on the parent container.",
                "translation": "Luego, están las unidades relativas, que son más flexibles. Se ajustan según otros elementos o configuraciones. Por ejemplo, los porcentajes (%) ajustan los tamaños en relación con un elemento padre. Esto es útil para el diseño adaptable, ya que los elementos cambian de tamaño según el contenedor padre.",
                "img": "",
                "audio": "https://res.cloudinary.com/dcxto1nnl/video/upload/v1704284143/academy-app/frases/2024/enero/2024-01-02/3/4_w49vxz.mp3"
            },
            {
                "id_paragraph": "3",
                "text": "Another relative unit is 'em'. It scales based on the font size of the element. If I set a font size to 16px and define a margin as 2em, the margin will be 32px. This unit is useful for maintaining consistent proportions.",
                "translation": "Otra unidad relativa es 'em'. Escala según el tamaño de la fuente del elemento. Si establezco un tamaño de fuente de 16px y defino un margen de 2em, el margen será de 32px. Esta unidad es útil para mantener proporciones consistentes.",
                "img": "",
                "audio": "https://res.cloudinary.com/dcxto1nnl/video/upload/v1704284144/academy-app/frases/2024/enero/2024-01-02/3/5_rxw4e7.mp3"
            },
        ]
    },






]