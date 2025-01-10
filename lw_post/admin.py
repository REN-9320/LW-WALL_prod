from django.contrib import admin
from .models import LW
from import_export import resources
from import_export.admin import ImportExportModelAdmin
from import_export.fields import Field
# Register your models here.

class LWResources(resources.ModelResource):
    
    #lastwords = Field(attribute='lastwords', column_name="あなたのLAST WORDSは何ですか？ (LAST WORDS = 死ぬ前に残したい言葉） What are your LAST WORDS? (LAST WORDS = Words you would like to leave behind before you die)")
    lastwords = Field(attribute='lastwords', column_name="あなたが死ぬ前に残したい言葉はなんですか？（LASTWORDS）")
    def before_import(self, dataset, **kwargs):
        # ヘッダーの改行を取り除く
        dataset.headers = [header.replace('\n', ' ').strip() for header in dataset.headers]

    
    class Meta:
        model = LW
        import_id_fields = ['lastwords'] 

    
@admin.register(LW)
# ImportExportModelAdminを継承したAdminクラスを作成する
class LWAdmin(ImportExportModelAdmin):
   ordering = ['id']
   list_display = ('id', 'lastwords',)
   # resource_classにModelResourceを継承したクラス設定
   resource_class = LWResources