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
import com.google.android.material.navigation.NavigationView;

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

import java.io.FileNotFoundException;
import java.io.IOException;

public class StudioFragment extends Fragment {

    private StudioViewModel studioViewModel;
    private ImageView imageView;
    private Context context;
    private View root;
    SharedPreferences sharedPref;
    SharedPreferences.Editor editor;

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

        // Initialize preference saver
        sharedPref = getActivity().getSharedPreferences("BBugPref", Context.MODE_MULTI_PROCESS);
        editor = sharedPref.edit();
        loadExistingBbug();

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

        Log.i("StudioFragment.java", "========== fragment run done ==========");
        return root;
    }

    private void loadExistingBbug() {
        // Update name
        final String storedBbugName = sharedPref.getString("bbugName", "Default Browserbee");
        TextView navHeaderTitle = root.findViewById(R.id.bbugName);
        navHeaderTitle.setText(storedBbugName);

        // Update texting style bars
        final int emojiVal = sharedPref.getInt("emojiVal", 1);
        SeekBar emojiBar = root.findViewById(R.id.emoji_bar); emojiBar.setProgress(emojiVal);
        final int capitalVal = sharedPref.getInt("capitalVal", 1);
        SeekBar capitalBar = root.findViewById(R.id.capital_bar); capitalBar.setProgress(capitalVal);
        final int punctVal = sharedPref.getInt("punctVal", 1);
        SeekBar punctBar = root.findViewById(R.id.punct_bar); punctBar.setProgress(punctVal);

        // Update image
        Uri avatarPath = null;
        try {
            avatarPath = Uri.parse(sharedPref.getString("avatarPath", null));
            Bitmap selectedImage = MediaStore.Images.Media.getBitmap(getActivity().getContentResolver(), avatarPath);
            selectedImage = selectedImage.createScaledBitmap(selectedImage, 128, 128, true); // scale img
            ImageView headerIcon = root.findViewById(R.id.avatar_preview);
            headerIcon.setImageBitmap(selectedImage);
        } catch (Exception ex) {
            Log.i("StudioFragment", "image failed to load" + avatarPath);
        }
    }

    private void saveBbug(Context context) {
        Log.i("StudioFragment", "=== saving bbug?? ===");

        // absorb values chosen
        // absorb name
        TextView bbugView = root.findViewById(R.id.bbugName);
        String bbugName = String.valueOf(bbugView.getText());
        editor.putString("bbugName", bbugName);
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

        // Update header name + image (though not activation)
        NavigationView navigationView = getActivity().findViewById(R.id.nav_view);
        View header = navigationView.getHeaderView(0);
        TextView navHeaderTitle = header.findViewById(R.id.nav_header_title);
        navHeaderTitle.setText(bbugName);

        final Uri avatarPath = Uri.parse(sharedPref.getString("avatarPath", null));
        try {
            Bitmap selectedImage = MediaStore.Images.Media.getBitmap(getActivity().getContentResolver(), avatarPath);
            selectedImage = selectedImage.createScaledBitmap(selectedImage, 128, 128, true); // scale img
            ImageView headerIcon = header.findViewById(R.id.iconImageView);
            headerIcon.setImageBitmap(selectedImage);
        } catch (FileNotFoundException ex) { // set to default image
            ImageView headerIcon = header.findViewById(R.id.iconImageView);
            headerIcon.setImageResource(R.drawable.logo);
            Log.i("StudioFragment", "file not found"+avatarPath);
        } catch (IOException ex) { // set to default image
            ImageView headerIcon = header.findViewById(R.id.iconImageView);
            headerIcon.setImageResource(R.drawable.logo);
            Log.i("StudioFragment", "can't access file"+avatarPath);
        }

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
                    Intent pickPhoto = new Intent(Intent. ACTION_GET_CONTENT ) ;
                    pickPhoto.setType( "image/*" ) ;
                    startActivityForResult(pickPhoto, 1 ) ;
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
        Log.i("StudioFragment", "selected picture path" + data.getData());
        editor.putString("avatarPath", String.valueOf(data.getData()));
        editor.commit();

        if(resultCode != RESULT_CANCELED) {
            switch (requestCode) {
                case 0:
                    Log.i("StudioFragment", "== case 0 ==");
                    if (resultCode == RESULT_OK && data != null) { // took photo with camera
                        Bitmap selectedImage = (Bitmap) data.getExtras().get("data");
                        selectedImage = selectedImage.createScaledBitmap(selectedImage, 128, 128, true); // scale img
                        imageView.setImageBitmap(selectedImage);
                    }

                    break;
                case 1:
                    Log.i("StudioFragment", "== case 1 ==");
                    if (resultCode == RESULT_OK && data != null) {
                        try {
                            Uri imageUri = data.getData() ;
                            Bitmap selectedImage = MediaStore.Images.Media.getBitmap(context.getContentResolver(), imageUri);
                            selectedImage = selectedImage.createScaledBitmap(selectedImage, 128, 128, true); // scale img
                            imageView.setImageBitmap(selectedImage);
                        } catch (Exception e) {
                            e.printStackTrace() ;
                        }
                    }
                    break;
            }
        }
    }
}