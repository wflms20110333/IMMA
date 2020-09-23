package com.example.browserbugandroid;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.util.Log;
import android.view.MenuItem;
import android.view.View;
import android.view.Menu;
import android.widget.ImageView;
import android.widget.TextView;

import com.example.browserbugandroid.ui.login.LoginActivity;
import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.google.android.material.snackbar.Snackbar;
import com.google.android.material.navigation.NavigationView;
import androidx.navigation.NavController;
import androidx.navigation.Navigation;
import androidx.navigation.ui.AppBarConfiguration;
import androidx.navigation.ui.NavigationUI;
import androidx.drawerlayout.widget.DrawerLayout;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

import java.security.spec.ECField;

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

        Log.i("MainActivity.java", "========== main activity started ==========");

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
        final String storedBbugName = sharedPref.getString("bbugName", "Default Browserbee");
        final String bbugActive = sharedPref.getString("bbugActive", "error 999");
        final Uri avatarPath = Uri.parse(sharedPref.getString("avatarPath", null));

        // Update header
        NavigationView navigationView = findViewById(R.id.nav_view);
        View header = navigationView.getHeaderView(0);
        TextView navHeaderTitle = header.findViewById(R.id.nav_header_title);
        TextView navHeaderText = header.findViewById(R.id.nav_header_text);
        navHeaderTitle.setText(storedBbugName);
        navHeaderText.setText(bbugActive);

        // Update header image
        try {
            Bitmap selectedImage = MediaStore.Images.Media.getBitmap(this.getContentResolver(), avatarPath);
            selectedImage = selectedImage.createScaledBitmap(selectedImage, 64, 64, true); // scale img
            ImageView headerIcon = header.findViewById(R.id.iconImageView);
            headerIcon.setImageBitmap(selectedImage);
        } catch (Exception ex) {
            Log.i("MainActivity", "image failed to load" + avatarPath);
        }

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