# Torii
Torii (鳥居) - 文化財オープンデータを効率よく管理できるようにするための管理用プログラム

## 概要

Toriiは位置情報に紐づく文化財オープンデータを効率よく管理できるようにするための管理用プログラムです。  
位置情報と紐づくデータは、オープンソースGISである[QGIS](https://qgis.org/ja/site/index.html)等のツールを用いて、GeoJSON等のテキストベース情報フォーマットで管理した方が、標準フォーマットでもあり、位置情報の管理もしやすく、複数のテーブル間のリレーションも定義でき、Web等での公開もしやすいという利点があります。  
しかしながら、位置情報以外の文字や数値データの一括処理などはQGISではしにくい、といった欠点も同時にあり、さらにQGISを覚えること自体も学習コストが高いという問題が同時にあります。

そこで、本プログラム(Torii)では、**データのマスタ情報をExcelとGeoJSON双方で管理**し、どちらを変更しても、中間データを介して、双方のマスタを変更に一致するように反映できるようにしました。  
データの更新後にToriiの提供するプログラムを実行すると、別途用意するデータ構造及びそのリレーション関係の設定ファイルの設定に従って、一方の更新を他方に伝搬してくれます。  
これにより、双方のマスタはどちらを変更しても常に等価になり、技術者や位置情報を更新したい時はQGIS、非技術者や部分一括変換などを行いたい時はExcelと管理ツールを使い分けられるようになります。  
(ただし、更新の方向は自動判定してくれるのではなく、一方向の更新プログラムを2つ用意している形なので、間違った側のプログラムを実行すると、古いデータで新しいデータを上書きする形になるので注意が必要です。)

また上記の他にも、Toriiのプログラムは以下のような機能も提供します。

* GeoJSONのフォーマットはテキストフォーマットではあるものの、QGISで編集した時、その他プログラムで編集した時など、微妙に改行位置やスペースの入る入らないなど差が生じるため、gitで管理しても変更箇所が検知できないが、更新後に必ずToriiを実行することで、フォーマットが揃いgitで変更箇所を管理できる。  
変更箇所が検知できるということは自動マージもでき、自動マージした結果をExcelに反映もできるので分散管理が容易になる。
* 画像ファイルを決まった仕様で設定ファイルに定義した画像フォルダに置くと、検知して自動で画像管理テーブル内のレコードの生成とサムネイルの生成を行ってくれる。
* Web等で公開しやすい、リレーション関係を解決して1つのファイルにしたGeoJSONファイルを生成してくれる。  
これにより、そのGeoJSONを読み込み表示するindex.htmlを準備し、github pages等のリポジトリの中身をWeb配信できるサービスで公開までしておけば、非技術者だけでもデータの更新からWebでの公開まで完結させられるようになる。

現状(1.0.0)ではまだ、既存の整備されたデータ管理までしか行えず、最初のデータ生成は技術のわかる人による手動生成が必要ですが、いずれは設定ファイルだけ用意すれば、Excel/GeoJSON双方及びQGISのリレーション設定済み初期ファイルまで、生成できるようにする予定です。

## 提供物

Windows 64ビット、Mac (Intel, M1)の実行ファイルを配布しております(現在 1.0.0)。  

### Windows用実行ファイル

* [qgis2Xlsx_win.exe](https://github.com/code4history/Torii/releases/download/v1.0.0/qgis2Xlsx_win.exe) (GeoJSON => Excel方向変換)
* [xlsx2Qgis_win.exe](https://github.com/code4history/Torii/releases/download/v1.0.0/xlsx2Qgis_win.exe) (Excel => GeoJSON方向変換)

### Intel Mac用実行ファイル

* [qgis2Xlsx_mac](https://github.com/code4history/Torii/releases/download/v1.0.0/qgis2Xlsx_mac) (GeoJSON => Excel方向変換)
* [xlsx2Qgis_mac](https://github.com/code4history/Torii/releases/download/v1.0.0/xlsx2Qgis_mac) (Excel => GeoJSON方向変換)

### M1 Mac用実行ファイル

* [qgis2Xlsx_macm1](https://github.com/code4history/Torii/releases/download/v1.0.0/qgis2Xlsx_macm1) (GeoJSON => Excel方向変換)
* [xlsx2Qgis_macm1](https://github.com/code4history/Torii/releases/download/v1.0.0/xlsx2Qgis_macm1) (Excel => GeoJSON方向変換)

## 利用方法

### 既存プロジェクトで用いる場合


### 新規プロジェクトで用いる場合

Toriiを用いた新しいプロジェクトを構築する手法については、追って手順書を用意する予定です。  
今しばらくお待ちください。


