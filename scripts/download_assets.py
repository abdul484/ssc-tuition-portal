import urllib.request
import os

urls = {
    'ssc_logo_main.png': 'https://lh3.googleusercontent.com/aida-public/AB6AXuALI7ufJ6fpectD03_fL2Dv6DlNkLrQCLXLzkNaZebGMsUN8Gb8Nn-TUXshGBuCWTVS3HD_QTk7mgCW8_S0I-BThR6wVf2lnmNwbj6_vYkW0BlPrrcrJ7WysnS5vY0W2m_O0v3Oz622DMZ09ZaICMBu49vA-YoJXQ22pXDA-v-KP9SUdRcQeiUBiwOthH5LHNaSwJQMgJuMmwYf-c4EdbHbHsQPHYrLQ51RtXAjEuUGCsAWfJTa26fXH9TFbEa9e-QhcvfK1ge5TbGR',
    'ssc_logo_icon.png': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIpPUv14z4cfYi_JpkYBjcBO5fWiZVGj2tLwATIzF3Is_fmYodGn0Pbw35paHJFl5u9FxKN4R733D4wNudPa_ojtbf1Ij_ENtbl9-ooWtb4wmPItbBo_DJHbd26uunEEYD6tmYEkbZScWBgO19eEn9cr5UGKpzsvDmVeL-ZCSsZP7szBPUkmPFxvftVl9bHZ6a7aZOnfDSON9k0P-hy5iprz7T7277kcBvVCZR4dANZjuYWgwx5MY-DRcWvnXjHba4',
    'ssc_logo_books.png': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCsFj2XBBTssvSrdHS6bbov6M1EFPYDghoh2G1X_p7sCwpYFy8JWu5AdBdzbbp2v3jist1w0m7Zf5TSASpXh1mA1fExov-m-VGKWOFsPMYAaaHu1fOowL1z0HxY5HKPHXxnL8UA7hjA1jwOPKuGUvsEn4memE2Rp7bKvR_A1OauiT220vbTcOLvS4-fOa-c0ubzw_QKtwDJFDMxI1o5li7t4mzpITK23hcA-2Fb4wqOkEaFuQaxPj-VrDKJy8Jb_1Tz',
    'ssc_logo_enroll.png': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCoS0c-jTAHxy0Q2o_AAyJPD0Ng9_s32XMIFl2pvv1hdwfyKdkzLddOSi5tWQEzQT1NWxf_6uqhsnI6bswVjSZFKR0I5Zvpvh2huz1GfiV4j5WrzY5CcY1yGrvwXsR4Ie410aDOXErBPnXA4NliQ8MO7Zlaasz2CjC5ntX_aSdZZD9Oy2wRvO2MWCnH457poZkP8hfZkhSV8TfeAwO6dFiizSdipSzvh4WIPU_wvcLKlxMR80R5ydxlzvwqf1dIYi8T',
    'ssc_logo_students.png': 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_t3fw5Pflkj-ljfEfPgLRwoWlRXxyM7Gr6GD7WShmgDawA_i13ERDMHKdsfaKqMzQ_vYQUcK7wlW07667GbLgw76v32SD8EyhvH_s5qjNARDOlQNKkkpYVhIL53aXV894joyP0xuC4XvfToPO_oXGg8MYUcIHq_438mdplIp5LwYCvKLIJE0KjaS_Br2HPZvclsSmrnNChaoNLkTiZOQWevctM6sHCERDMcaftC-u59pZKT5emnM3d9lozvDYyjy9',
    'ssc_logo_admin.png': 'https://lh3.googleusercontent.com/aida-public/AB6AXuClOVX209u4kM-TdkGLqOJV2Gmu_dn2vqegQPtgt4QrtADHTMDdGf4ZeH3X8x3lewiuU_XEnxGuB6QaMBMppE43l0pEL-jT145olJspfd-5568ihcFdy692dvwtYSThlah_6RXT3bJBobxVTIeH0yrLD_l0uZ9DCaoh_a9mkN_kQv3u6XZ0Ve3Sr2CQuLD7NAA8p7YMwfB4qNsKp8xvKKckmusKuTtGOQS0kt4WRHTc-RbYYTubU7hIaD9K7UWxu-mo'
}

os.makedirs('assets/images', exist_ok=True)
for name, url in urls.items():
    dest = os.path.join('assets', 'images', name)
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as resp, open(dest, 'wb') as f:
            f.write(resp.read())
        print(f"Downloaded {name}: {os.path.getsize(dest)} bytes")
    except Exception as e:
        print(f"Failed to download {name}: {e}")
