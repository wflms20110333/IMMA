package com.example.browserbugandroid.ui.studio;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProviders;

import com.example.browserbugandroid.R;
import com.example.browserbugandroid.ui.options.OptionsFragment;

import android.content.Context;
import android.content.DialogInterface;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.provider.MediaStore;
import android.widget.Button;
import android.widget.ImageView;
import androidx.appcompat.app.AlertDialog;
import androidx.navigation.Navigation;

import static android.app.Activity.RESULT_CANCELED;
import static android.app.Activity.RESULT_OK;
import android.content.SharedPreferences;
import android.widget.SeekBar;
import android.widget.TextView;
import android.widget.Toast;

public class StudioFragment extends Fragment {

    private StudioViewModel studioViewModel;
    private ImageView imageView;
    private Context context;
    private View root;

    public View onCreateView(@NonNull LayoutInflater inflater,
            ViewGroup container, Bundle savedInstanceState) {
        Log.i("StudioFragment.java", "========== fragment run ==========");
        // Initialize variables
        studioViewModel =
                ViewModelProviders.of(this).get(StudioViewModel.class);
        root =
                inflater.inflate(R.layout.fragment_studio, container, false);
        imageView =
                (ImageView) root.findViewById(R.id.avatar_preview);
        context = getContext();

        // Link buttons to listeners
        Button fab = (Button) root.findViewById(R.id.avatar_change_button);
        Button saver = (Button) root.findViewById(R.id.save_button);
        fab.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                selectImage(context);
            }
        });
        saver.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                saveBbug(context);
            }
        });

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

    private void saveBbug(Context context) {
        Log.i("StudioFragment", "=== saving bbug?? ===");

        // absorb values chosen
        SharedPreferences sharedPref = getActivity().getPreferences(Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = sharedPref.edit();
        // absorb name
        TextView bbugView = root.findViewById(R.id.bbugName);
        String bbugName = String.valueOf(bbugView.getText());
        // absorb texting style
        SeekBar emojiBar = root.findViewById(R.id.emoji_bar);
        editor.putInt("emojiVal", emojiBar.getProgress());
        SeekBar capitalBar = root.findViewById(R.id.capital_bar);
        editor.putInt("capitalVal", capitalBar.getProgress());
        SeekBar punctBar = root.findViewById(R.id.punct_bar);
        editor.putInt("punctVal", punctBar.getProgress());

        editor.commit();

        Toast.makeText(context,bbugName+" has been saved!",Toast.LENGTH_SHORT).show();

        // Open options page
        Navigation.findNavController(root).navigate(R.id.nav_options);
    }

    private void selectImage(Context context) {
        Log.i("StudioFragment", "=== selecting image?? ===");
        final CharSequence[] options = { "Take Photo", "Choose from Gallery","Cancel" };

        AlertDialog.Builder builder = new AlertDialog.Builder(context);
        builder.setTitle("Choose a picture");

        builder.setItems(options, new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int item) {
                Log.i("StudioFragment", "=== image option click ===");
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
                    Log.i("StudioFragment", "== case 0 ==");
                    if (resultCode == RESULT_OK && data != null) {
                        Bitmap selectedImage = (Bitmap) data.getExtras().get("data");
                        imageView.setImageBitmap(selectedImage);
                    }

                    break;
                case 1:
                    Log.i("StudioFragment", "== case 1 ==");
                    if (resultCode == RESULT_OK && data != null) {
                        Uri selectedImage =  data.getData();
                        String[] filePathColumn = {MediaStore.Images.Media.DATA};
                        if (selectedImage != null) {
                            Log.i("StudioFragment", "selected picture at" + selectedImage);
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