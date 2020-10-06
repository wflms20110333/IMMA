package com.example.browserbugandroid;

import android.app.Activity;
import android.os.Bundle;

import androidx.appcompat.app.AppCompatActivity;
import androidx.navigation.NavController;
import androidx.navigation.Navigation;

import android.view.View;
import android.widget.Button;

public class AboutActivity extends AppCompatActivity {
    Activity thisActivity;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.fragment_about);
        thisActivity = this;

        Button backButton = (Button) findViewById(R.id.about_back_button);
        backButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                NavController navController = Navigation.findNavController(thisActivity, R.id.nav_host_fragment);
                navController.navigate(R.id.nav_options);
            }
        });
    }
}