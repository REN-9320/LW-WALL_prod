from django.contrib import admin
from .models import LW
from import_export import resources
from import_export.admin import ImportExportModelAdmin
from import_export.fields import Field
import random
# Register your models here.

def randint_exclude(max_screen, ex):
    i = random.randint(1,max_screen)
    while i == ex:
        i = random.randint(1,max_screen)
    return i

class LWResources(resources.ModelResource):
    
    #lastwords = Field(attribute='lastwords', column_name="あなたのLAST WORDSは何ですか？ (LAST WORDS = 死ぬ前に残したい言葉） What are your LAST WORDS? (LAST WORDS = Words you would like to leave behind before you die)")
    lastwords = Field(attribute='lastwords', column_name="あなたが死ぬ前に残したい言葉はなんですか？（LASTWORDS）")
    def before_import(self, dataset, **kwargs):
        # ヘッダーの改行を取り除く
        dataset.headers = [header.replace('\n', ' ').strip() for header in dataset.headers]
    
    def before_import_row(self, row, **kwargs):
        row["seed_screen"] = randint_exclude(5, 3)
        row["seed_x"] = random.randint(0, 4)
    
    class Meta:
        model = LW
        import_id_fields = ['lastwords'] 

    
@admin.register(LW)
# ImportExportModelAdminを継承したAdminクラスを作成する
class LWAdmin(ImportExportModelAdmin):
   ordering = ['id']
   list_display = ('id', 'lastwords', 'seed_screen', 'seed_x')
   # resource_classにModelResourceを継承したクラス設定
   resource_class = LWResources