package com.example.browserbugandroid.ui.studio;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.Observer;
import androidx.lifecycle.ViewModelProviders;

import com.example.browserbugandroid.AboutActivity;
import com.example.browserbugandroid.NotifActivity;
import com.example.browserbugandroid.R;

import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.provider.MediaStore;
import android.util.Log;
import android.widget.Button;
import android.widget.ImageView;
import androidx.appcompat.app.AlertDialog;
import static android.app.Activity.RESULT_CANCELED;
import static android.app.Activity.RESULT_OK;

public class StudioFragment extends Fragment {

    private StudioViewModel studioViewModel;
    private ImageView imageView;
    private Context context;

    public View onCreateView(@NonNull LayoutInflater inflater,
            ViewGroup container, Bundle savedInstanceState) {
        studioViewModel =
                ViewModelProviders.of(this).get(StudioViewModel.class);
        View root = inflater.inflate(R.layout.fragment_studio, container, false);
        imageView = (ImageView) root.findViewById(R.id.avatar_preview);
        Button fab = (Button) root.findViewById(R.id.avatar_change_button);

        context = getContext();

        // Link avatar change button
        fab.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                selectImage(context);
            }
        });

        Log.i("StudioFragment.java", "========== fragment run ==========");

        /*final TextView textView = root.findViewById(R.id.text_slideshow);
        studioViewModel.getText().observe(getViewLifecycleOwner(), new Observer<String>() {
            @Override
            public void onChanged(@Nullable String s) {
                textView.setText(s);
            }
        });*/
        Log.i("StudioFragment.java", "========== fragment run done ==========");
        return root;
    }

    private void selectImage(Context context) {
        Log.i("MyBrowserbugsFragment", "=== selecting image?? ===");
        final CharSequence[] options = { "Take Photo", "Choose from Gallery","Cancel" };

        AlertDialog.Builder builder = new AlertDialog.Builder(context);
        builder.setTitle("Choose a picture");

        builder.setItems(options, new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int item) {
                Log.i("MyBrowserbugsFragment", "=== image option click ===");
                if (options[item].equals("Take Photo")) {
                    Intent takePicture = new Intent(android.provider.MediaStore.ACTION_IMAGE_CAPTURE);
                    startActivityForResult(takePicture, 0);
                } else if (options[item].equals("Choose from Gallery")) {
                    Intent pickPhoto = new Intent(Intent.ACTION_PICK, android.provider.MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
                    startActivityForResult(pickPhoto , 1);
                } else if (options[item].equals("Cancel")) {
                    dialog.dismiss();
                }
            }
        });
        builder.show();
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        Log.i("MyBrowserbugsFragment", "=== activity result?? ===");
        if(resultCode != RESULT_CANCELED) {
            switch (requestCode) {
                case 0:
                    Log.i("MyBrowserbugsFragment", "== case 0 ==");
                    if (resultCode == RESULT_OK && data != null) {
                        Bitmap selectedImage = (Bitmap) data.getExtras().get("data");
                        imageView.setImageBitmap(selectedImage);
                    }

                    break;
                case 1:
                    Log.i("MyBrowserbugsFragment", "== case 1 ==");
                    if (resultCode == RESULT_OK && data != null) {
                        Uri selectedImage =  data.getData();
                        String[] filePathColumn = {MediaStore.Images.Media.DATA};
                        if (selectedImage != null) {
                            Cursor cursor = context.getContentResolver().query(selectedImage,
                                    filePathColumn, null, null, null);
                            if (cursor != null) {
                                cursor.moveToFirst();

                                int columnIndex = cursor.getColumnIndex(filePathColumn[0]);
                                String picturePath = cursor.getString(columnIndex);
                                imageView.setImageBitmap(BitmapFactory.decodeFile(picturePath));
                                cursor.close();
                            }
                        }

                    }
                    break;
            }
        }
    }
}