package com.example.browserbugandroid;

import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.view.View;
import android.view.Menu;
import android.widget.ImageView;
import android.widget.TextView;

import com.google.android.material.navigation.NavigationView;
import androidx.navigation.NavController;
import androidx.navigation.Navigation;
import androidx.navigation.ui.AppBarConfiguration;
import androidx.navigation.ui.NavigationUI;
import androidx.drawerlayout.widget.DrawerLayout;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

public class MainActivity extends AppCompatActivity {

    private AppBarConfiguration mAppBarConfiguration;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        DrawerLayout drawer = findViewById(R.id.drawer_layout);
        NavigationView navigationView = findViewById(R.id.nav_view);

        // Passing each menu ID as a set of Ids because each
        // menu should be considered as top level destinations.
        mAppBarConfiguration = new AppBarConfiguration.Builder(
                R.id.nav_about, R.id.nav_options, R.id.nav_studio, R.id.nav_my_account, R.id.nav_help)
                .setDrawerLayout(drawer)
                .build();
        NavController navController = Navigation.findNavController(this, R.id.nav_host_fragment);
        NavigationUI.setupActionBarWithNavController(this, navController, mAppBarConfiguration);
        NavigationUI.setupWithNavController(navigationView, navController);

        View header = navigationView.getHeaderView(0);
        TextView navHeaderTitle = header.findViewById(R.id.nav_header_title);
        TextView navHeaderText = header.findViewById(R.id.nav_header_text);
        navHeaderTitle.setText("error 998"); // text should be updated in onCreateOptionsMenu
        navHeaderText.setText("error 998");
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Get saved bbug name, activation status, image
        SharedPreferences sharedPref = this.getSharedPreferences("BBugPref", Context.MODE_MULTI_PROCESS);
        final String storedBbugName = sharedPref.getString("bbugName", "Browserbee");
        final String bbugActive = sharedPref.getString("bbugActive", "inactive");

        // Update header
        NavigationView navigationView = findViewById(R.id.nav_view);
        View header = navigationView.getHeaderView(0);
        TextView navHeaderTitle = header.findViewById(R.id.nav_header_title);
        TextView navHeaderText = header.findViewById(R.id.nav_header_text);
        navHeaderTitle.setText(storedBbugName);
        navHeaderText.setText(bbugActive);

        // Update header image
        Uri avatarPath = null;
        ImageView headerIcon = header.findViewById(R.id.iconImageView);
        Bitmap selectedImage;
        try {
            avatarPath = Uri.parse(sharedPref.getString("avatarPath", null));
            selectedImage = MediaStore.Images.Media.getBitmap(this.getContentResolver(), avatarPath);
        } catch (Exception ex) {
            selectedImage = BitmapFactory.decodeResource(getApplicationContext().getResources(), R.drawable.logo);
        }
        selectedImage = selectedImage.createScaledBitmap(selectedImage, 90, 90, true); // scale img
        headerIcon.setImageBitmap(selectedImage);

        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.main, menu);
        return true;
    }

    @Override
    public boolean onSupportNavigateUp() {
        NavController navController = Navigation.findNavController(this, R.id.nav_host_fragment);
        return NavigationUI.navigateUp(navController, mAppBarConfiguration)
                || super.onSupportNavigateUp();
    }
}