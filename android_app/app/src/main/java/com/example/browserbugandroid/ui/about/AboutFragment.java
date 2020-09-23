package com.example.browserbugandroid.ui.about;

import android.app.AlarmManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.SystemClock;
import android.provider.MediaStore;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemSelectedListener;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.CompoundButton;
import android.widget.ImageView;
import android.widget.Spinner;
import android.widget.Switch;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProviders;
import androidx.navigation.NavController;
import androidx.navigation.Navigation;

import com.example.browserbugandroid.Alarm_Receiver;
import com.example.browserbugandroid.R;
import com.google.android.material.navigation.NavigationView;

import java.util.Hashtable;

public class AboutFragment extends Fragment {

    // to make an alarm manager
    AlarmManager alarm_manager;
    Spinner freq_picker;
    TextView bbug_name;
    Switch activation_switch;
    PendingIntent pending_intent;
    Context context;
    private View root;
    final String CHANNEL_ID = "bbugChannel";

    SharedPreferences sharedPref;
    SharedPreferences.Editor editor;

    NavigationView navigationView;
    View header;

    // temporarily store dictionary for spinner labels -> milliseconds
    Hashtable<String, Integer> spinner_dict = new Hashtable<String, Integer>();

    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {
        root = inflater.inflate(R.layout.fragment_about, container, false);
        context = getContext();
        Log.i("AboutFragment.java", "========== about page opened ==========");
        View root = inflater.inflate(R.layout.fragment_about, container, false);

        Button backButton = (Button) root.findViewById(R.id.about_back_button);
        backButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                NavController navController = Navigation.findNavController(getActivity(), R.id.nav_host_fragment);
                navController.navigate(R.id.nav_options);
            }
        });

        return root;
    }
}